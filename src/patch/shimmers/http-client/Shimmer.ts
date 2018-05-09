import {HttpClientShimmer} from 'pandora-hook'
import {ClientRequest, ServerResponse} from 'http'
import {query} from '../../../util/QueryParser'
import {safeParse} from '../../../util/Utils'
import {parse as parseQS} from 'querystring';

const debug = require('debug')('PandoraHook:HttpClient:Shimmer')

export class KlgHttpClientShimmer extends HttpClientShimmer {

  buildTagsAndLog (args, _request, span, tracer) {
    const tags = this.buildTags(args, _request)
    span.addTags(tags)
    span.log({
      query: query({url: _request.path})
    })
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

      self.buildTagsAndLog(args, _request, span, tracer)

      self.wrapRequest(_request, tracer, span)

      return _request
    }
  }

  wrapRequest = (request, tracer, span) => {
    const traceManager = this.traceManager
    const shimmer = this.shimmer
    const self = this

    /**
     * 为什么不 super.wrapRequest(request, tracer, span)？因为父类 是以成员变量的方式定义 wrapRequest，无法 super
     */
    shimmer.wrap(request, 'emit', function requestEmitWrapper (emit) {
      const bindRequestEmit = traceManager.bind(emit)

      return function wrappedRequestEmit (this: ServerResponse, event, arg) {
        if (event === 'error') {
          self.handleError(span, arg)
        } else if (event === 'response') {
          self.handleResponse(tracer, span, arg)
        }

        return bindRequestEmit.apply(this, arguments)
      }
    })

    /**
     * 结束发送请求。 如果部分请求主体还未被发送，则会刷新它们到流中。 如果请求是分块的，则会发送终止字符 '0\r\n\r\n'。
     * 如果指定了 data，则相当于调用 request.write(data, encoding) 之后再调用 request.end(callback)。
     * 见：http://nodejs.cn/api/http.html#http_request_end_data_encoding_callback
     */
    shimmer.wrap(request, 'end', function requestWriteWrapper (write) {
      const bindRequestWrite = traceManager.bind(write)

      return function wrappedRequestWrite (this: ClientRequest, data, encoding) {
        if (dataTypeFilter(data, encoding)) {
          handleBody(span, data)
        }
        return bindRequestWrite.apply(this, arguments)
      }
    })

    function dataTypeFilter (chunk, encoding) {
      const hasChunk = chunk && typeof(chunk) === 'string'
      const isUtf8 = encoding === undefined || encoding === 'utf8' // default is utf8
      return (hasChunk && isUtf8)
    }

    function handleBody (this: any, span, chunk) {
      if (span) {
        span.log({
          data: parseQS(chunk) || safeParse(chunk)
        })
      }
    }
  }
}
