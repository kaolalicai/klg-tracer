import {HttpServerPatcher} from 'pandora-hook'
import {ParsedUrlQuery} from 'querystring'
import {IncomingMessage} from 'http'
import {safeParse} from '../util/Utils'

const debug = require('debug')('PandoraHook:HttpServerPatcher')

export class KlgHttpServerPatcher extends HttpServerPatcher {
  constructor (options?: {
    recordResponse?: boolean,
    recordGetParams?: boolean,
    recordPostData?: boolean
  }) {
    super(options)
  }

  wrapResponse (options, response, tracer, span) {
    const traceManager = this.getTraceManager()
    const shimmer = this.getShimmer()

    // 为了记录 response 参数 见 http://nodejs.cn/api/http.html#http_response_end_data_encoding_callback
    shimmer.wrap(response, 'write', function responseWriteWrapper (write) {
      const bindRequestWrite = traceManager.bind(write)
      return function wrappedResponseWrite (chunk, encoding, callback) {
        responseLog(response, chunk, encoding)
        return bindRequestWrite.apply(this, arguments)
      }
    })

    shimmer.wrap(response, 'end', function responseWriteWrapper (write) {
      const bindRequestWrite = traceManager.bind(write)
      return function wrappedResponseWrite (chunk, encoding, callback) {
        responseLog(response, chunk, encoding)
        return bindRequestWrite.apply(this, arguments)
      }
    })

    function responseLog (response, chunk, encoding) {
      if (contentTypeFilter(response) && dataTypeFilter(chunk, encoding)) {
        handleResponse(span, chunk)
      }
    }

    /**
     * 未指定 contentType 或者 contentType 包含 text or json
     * @param response
     * @returns {boolean}
     */
    function contentTypeFilter (response) {
      const contentType = response.getHeader('content-type')
      return !contentType || contentType.indexOf('text') > -1 || contentType.indexOf('json') > -1
    }

    function dataTypeFilter (chunk, encoding) {
      const hasChunk = chunk && typeof(chunk) === 'string'
      const isUtf8 = encoding === undefined || encoding === 'utf8' // default is utf8
      return (hasChunk && isUtf8)
    }

    function handleResponse (span, chunk) {
      const response = safeParse(chunk)
      span.log({
        response
      })
    }
  }

  shimmer (options) {
    const self = this
    const traceManager = this.getTraceManager()
    const shimmer = this.getShimmer()

    shimmer.wrap(this.getModule(), 'createServer', function wrapCreateServer (createServer) {

      return function wrappedCreateServer (this: any, requestListener) {
        if (requestListener) {

          const listener = traceManager.bind(function (req, res) {
            const requestFilter = options.requestFilter || self.requestFilter

            if (requestFilter(req)) {
              debug('request filter by requestFilter, skip trace.')
              return requestListener(req, res)
            }

            traceManager.bindEmitter(req)
            traceManager.bindEmitter(res)

            const tracer = self.createTracer(req)
            self._beforeExecute(tracer, req, res)
            const tags = self.buildTags(req)
            const span = self.createSpan(tracer, tags)

            if (options.recordGetParams) {
              const query = self.processGetParams(req)

              span.log({
                query
              })
            }

            let chunks = []
            if (options.recordPostData && req.method && req.method.toUpperCase() === 'POST') {
              shimmer.wrap(req, 'emit', function wrapRequestEmit (emit) {
                const bindRequestEmit = traceManager.bind(emit)

                return function wrappedRequestEmit (this: IncomingMessage, event) {
                  if (event === 'data') {
                    const chunk = arguments[1] || []

                    chunks.push(chunk)
                  }

                  return bindRequestEmit.apply(this, arguments)
                }
              })
            }
            self.wrapResponse(options, res, tracer, span)

            tracer.named(`HTTP-${tags['http.method'].value}:${tags['http.url'].value}`)
            tracer.setCurrentSpan(span)

            function onFinishedFactory (eventName) {
              return function onFinished () {
                res.removeListener('finish', onFinished)
                req.removeListener('aborted', onFinished)

                if (eventName !== 'aborted' && options.recordPostData && req.method && req.method.toUpperCase() === 'POST') {
                  const transformer = options.bufferTransformer || self.bufferTransformer
                  const postData = transformer(chunks)

                  span.log({
                    data: postData
                  })
                  // clear cache
                  chunks = []
                }

                span.setTag('http.aborted', {
                  type: 'bool',
                  value: eventName === 'aborted'
                })

                self.beforeFinish(span, res)
                span.finish()
                tracer.finish(options)
                self.afterFinish(span, res)
              }
            }

            res.once('finish', onFinishedFactory('finish'))
            req.once('aborted', onFinishedFactory('aborted'))

            return requestListener(req, res)
          })

          return createServer.call(this, listener)
        }

        debug('no requestListener, skip trace.')
        return createServer.call(this, requestListener)
      }
    })
  }
}
