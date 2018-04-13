import * as http from 'http'
import {Patcher} from './Patcher'
import {HEADER_TRACE_ID} from '../util/Constants'
import {getRandom64} from '../util/TraceUtil'
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
            tracer.setAttr('userId', '122000')
            res.once('finish', () => {
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
