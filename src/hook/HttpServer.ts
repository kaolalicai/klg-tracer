import * as http from 'http'
import {Patcher} from './Patcher'
import {HEADER_TRACE_ID} from '../util/Constants'
import {getRandom64} from '../util/TraceUtil'
import {extractPath} from '../util/Utils'
import {wrap} from '../trace/Shimmer'
import {createNamespace} from 'cls-hooked'

export class HttpServerPatcher extends Patcher {

  constructor (options = {}) {
    super(options)
  }

  getModule (): any {
    return http
  }

  getModuleName (): string {
    return 'httpServer'
  }

  getTraceId (req) {
    return req.headers[HEADER_TRACE_ID] || getRandom64()
  }

  buildTags (req) {

    return {
      'http.method': {
        value: req.method.toUpperCase(),
        type: 'string'
      },
      'http.url': {
        value: extractPath(req.url),
        type: 'string'
      },
      'http.client': {
        value: false,
        type: 'bool'
      }
    }
  }

  createSpan (tracer, tags) {
    const span = tracer.startSpan('http', {
      traceId: tracer.traceId
    })

    span.addTags(tags)

    return span
  }

  requestFilter (req) {
    return false
  }

  createTracer (req) {
    const traceId = this.getTraceId(req)

    return this.getTraceManager().create({traceId})
  }

  shimmer () {
    const self = this
    const traceManager = this.getTraceManager()

    wrap(this.getModule(), 'createServer', function wrapCreateServer (createServer) {
      return function wrappedCreateServer (this: any, requestListener) {
        if (requestListener) {
          const listener = traceManager.bind(function (req, res) {
            if (self.requestFilter(req)) {
              return requestListener(req, res)
            }
            traceManager.bindEmitter(req)
            traceManager.bindEmitter(res)

            const tracer = self.createTracer(req)
            const tags = self.buildTags(req)
            const span = self.createSpan(tracer, tags)
            tracer.setAttr('userId', '122000')
            res.once('finish', () => {
              span.finish()
              tracer.finish()
            })
            return requestListener(req, res)
          })

          return createServer.call(this, listener)
        }
        return createServer.call(this, requestListener)
      }
    })
  }

}
