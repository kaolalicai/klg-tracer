import * as http from 'http'
import {Patcher} from './Patcher'
import {HEADER_TRACE_ID, QUERY_TRACE_ID} from '../util/Constants'
import {getRandom64} from '../util/TraceUtil'
import {extractPath, safeParse, isFunction} from '../util/Utils'
import {Tracer} from '../trace/Tracer'
import {createNamespace} from 'cls-hooked'
import * as bodyParser from 'koa-bodyparser'
import {HookOptions} from '../domain'

export class KoaServerPatcher extends Patcher {
  app: any
  interceptor: Function

  constructor (app, options?: HookOptions) {
    super(options)
    if (options && options.interceptor) {
      this.interceptor = options.interceptor
      if (!isFunction(options.interceptor)) throw new Error('KoaServer interceptor must be a function')
    }
    this.app = app
  }

  getModule (): any {
    return this.app
  }

  getModuleName (): string {
    return 'koaServer'
  }

  getTraceId (request) {
    return request.headers[HEADER_TRACE_ID] || request.query[QUERY_TRACE_ID] || getRandom64()
  }

  buildRequestTags (request) {
    return {
      'http.method': {
        value: request.method.toUpperCase(),
        type: 'string'
      },
      'http.url': {
        value: extractPath(request.url),
        type: 'string'
      },
      'http.query': {
        value: request.query,
        type: 'object'
      },
      'http.body': {
        value: request.body,
        type: 'object'
      }
    }
  }

  buildResponseTags (ctx) {
    return {
      'http.res.status': {
        value: ctx.status,
        type: typeof(ctx.status)
      },
      'http.response': {
        value: safeParse(ctx.body),
        type: typeof(ctx.body)
      }
    }
  }

  createSpan (tracer, tags) {
    const span = tracer.startSpan('http-server', {
      traceId: tracer.traceId
    })
    span.addTags(tags)
    return span
  }

  requestFilter (req) {
    return false
  }

  createTracer (request): Tracer {
    const traceId = this.getTraceId(request)
    return this.getTraceManager().create({traceId})
  }

  shimmer () {
    const self = this
    const traceManager = this.getTraceManager()
    this.app.use(traceManager.bind(async function (ctx, next) {
      if (self.requestFilter(ctx.request)) return await next()

      traceManager.bindEmitter(ctx.req)
      traceManager.bindEmitter(ctx.res)

      const tracer = self.createTracer(ctx.request)
      const tags = self.buildRequestTags(ctx.request)
      const span = self.createSpan(tracer, tags)

      tracer.named(`HTTP-${tags['http.method'].value}:${tags['http.url'].value}`)
      tracer.setCurrentSpan(span)
      if (self.interceptor) self.interceptor(ctx, tracer)

      await next()

      span.addTags(self.buildResponseTags(ctx))
      span.finish()
      tracer.finish()
    }))
  }
}
