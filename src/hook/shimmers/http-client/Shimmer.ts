const assert = require('assert')
const debug = require('debug')('Klg:Tracer:HttpClient:Shimmer')
import {DEFAULT_HOST, DEFAULT_PORT, HEADER_SPAN_ID, HEADER_TRACE_ID} from '../../../util/Constants'
import {nodeVersion, safeParse} from '../../../util/Utils'
import {query} from '../../../util/QueryParser'
import {ClientRequest} from 'http'

// TODO: 接受参数，处理或记录请求详情
export class HttpClientShimmer {

  options = {}
  shimmer = null
  traceManager = null

  constructor (shimmer, traceManager, options) {
    assert(shimmer, 'shimmer must given')
    assert(traceManager, 'traceManager must given')

    Object.assign(this.options, options)
    this.shimmer = shimmer
    this.traceManager = traceManager
  }

  wrapHttpRequest (target) {
    this.shimmer.wrap(target, 'request', this.httpRequestWrapper)

    if (nodeVersion('>=8')) {
      this.shimmer.wrap(target, 'get', this.httpRequestWrapper)
    }
  }

  remoteTracing (args, tracer, span) {
    const options = args[0]
    const traceId = tracer.traceId || ''
    const spanId = span.context().spanId || ''

    if (options.headers) {
      if (!options.headers[HEADER_TRACE_ID]) {
        debug('set header trace id.')
        options.headers[HEADER_TRACE_ID] = traceId
      }

      if (!options.headers[HEADER_SPAN_ID]) {
        debug('set header span id.')
        options.headers[HEADER_SPAN_ID] = spanId
      }
    } else {
      options.headers = {
        [HEADER_TRACE_ID]: traceId,
        [HEADER_SPAN_ID]: spanId
      }
    }

    return args
  }

  createSpan (tracer) {
    let span = null

    const currentSpan = tracer.getCurrentSpan()

    if (!currentSpan) {
      debug('No current span, skip trace')
      return span
    }

    return this._createSpan(tracer, currentSpan)
  }

  httpRequestWrapper = (request) => {
    const self = this
    const traceManager = this.traceManager
    const options = self.options

    return function wrappedHttpRequest (this: ClientRequest) {
      const tracer = traceManager.getCurrentTracer()
      let args = Array.from(arguments)

      if (!tracer) {
        debug('No current tracer, skip trace')
        return request.apply(this, args)
      }

      const span = self.createSpan(tracer)

      if (!span) {
        debug('Create new span empty, skip trace')
        return request.apply(this, args)
      }

      if ((options as any).remoteTracing) {
        args = self.remoteTracing(args, tracer, span)
      }

      const _request = request.apply(this, args)

      const tags = self.buildTags(args, _request)

      span.addTags(tags)

      self.wrapRequest(_request, tracer, span)

      return _request
    }
  }

  wrapRequest = (request, tracer, span) => {
    const traceManager = this.traceManager
    const shimmer = this.shimmer
    const self = this

    shimmer.wrap(request, 'emit', function requestEmitWrapper (emit) {
      const bindRequestEmit = traceManager.bind(emit)

      return function wrappedRequestEmit (this: ClientRequest, event, arg) {
        if (event === 'error') {
          self.handleError(span, arg)
        } else if (event === 'response') {
          self.handleResponse(tracer, span, arg)
        }

        return bindRequestEmit.apply(this, arguments)
      }
    })

    // 为了记录 request post 参数
    shimmer.wrap(request, 'write', function requestWriteWrapper (write) {
      const bindRequestWrite = traceManager.bind(write)

      return function wrappedRequestWrite (this: ClientRequest, chunk, encoding) {
        const hasChunk = chunk && typeof(chunk) === 'string'
        const isUtf8 = encoding === undefined || encoding === 'utl8' // default is utf8
        if (hasChunk && isUtf8) {
          self.handleBody(span, chunk)
        }
        return bindRequestWrite.apply(this, arguments)
      }
    })
  }

  handleBody (this: any, span, chunk) {
    if (span) {
      span.addTags({
        'http.body': {
          value: safeParse(chunk),
          type: 'object'
        }
      })
    }
  }

  handleError (this: any, span, arg) {
    if (span) {
      span.error(true)

      this._requestError(arg, span)

      span.finish()
      this._finish(arg, span)
    }
  }

  handleResponse (tracer, span, res) {
    const traceManager = this.traceManager
    const shimmer = this.shimmer
    const self = this

    res.responseSize = 0
    shimmer.wrap(res, 'emit', function wrapResponseEmit (emit) {
      const bindResponseEmit = traceManager.bind(emit)

      return function wrappedResponseEmit (this: ClientRequest, event) {
        if (event === 'end') {
          if (span) {

            span.error(false)

            self._responseEnd(res, span)

            tracer.setCurrentSpan(span)
            span.finish()
            self._finish(res, span)
          }
        } else if (event === 'data') {
          const chunk = arguments[0]
          res.responseSize += chunk.length
        }

        return bindResponseEmit.apply(this, arguments)
      }
    })
  }

  protected _requestError (res, span) {
    span.setTag('http.error_code', {
      type: 'string',
      value: res.code
    })

    span.setTag('http.status_code', {
      type: 'number',
      value: -1 // 请求过程失败
    })
  }

  protected _responseEnd (res, span) {
    const responseSize = (res.headers && res.headers['content-length']) || res.responseSize

    span.setTag('http.status_code', {
      type: 'number',
      value: res.statusCode
    })

    if (res && res.headers && res.headers['content-type'] === 'application/json') {
      span.setTag('http.response', {
        type: 'object',
        value: safeParse(res.text)
      })
    }

    // span.setTag('http.remote_ip', {
    //   type: 'number',
    //   value: remoteIp
    // })

    span.setTag('http.response_size', {
      type: 'number',
      value: responseSize
    })
  }

  protected _finish (res, span) {
    // empty
  }

  protected buildTags (args, request) {
    const options = args[0]

    return {
      'http.query': {
        value: query({url: request.path}),
        type: 'object'
      },
      'http.method': {
        value: options.method || 'GET', // use 'GET' default, like node.js
        type: 'string'
      },
      'http.hostname': {
        value: options.hostname || options.host || DEFAULT_HOST,
        type: 'string'
      },
      'http.port': {
        value: options.port || options._defaultAgent && options._defaultAgent.defaultPort || DEFAULT_PORT,
        type: 'number'
      },
      'http.path': {
        value: request.path || '/', // use '/' default, like node.js
        type: 'string'
      }
    }
  }

  protected _createSpan (tracer, currentSpan) {
    const traceId = tracer.traceId

    return tracer.startSpan('http-client', {
      childOf: currentSpan,
      traceId
    })
  }
}
