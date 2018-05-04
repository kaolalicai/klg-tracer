import * as http from 'http'
import {HEADER_TRACE_ID, QUERY_TRACE_ID} from '../util/Constants'
import {getRandom64} from '../util/TraceUtil'
import {safeParse, isFunction} from '../util/Utils'
import {Tracer} from '../trace/Tracer'
import {createNamespace} from 'cls-hooked'
import * as bodyParser from 'koa-bodyparser'
import {ServerHookOptions, interceptor} from '../domain'

import {HttpServerPatcher} from 'pandora-hook'

/**
 * 简化实现，直接外部传入 app 对象
 * TODO hack koa
 */
export class KoaServerPatcher extends HttpServerPatcher {
  interceptor: interceptor

  constructor (options?: ServerHookOptions) {
    super(options)
    if (options && options.interceptor) {
      this.interceptor = options.interceptor
      if (!isFunction(options.interceptor)) throw new Error('KoaServer interceptor must be a function')
    }
  }

  getModuleName (): string {
    return 'koa'
  }

  getTraceId (request) {
    return request.headers[HEADER_TRACE_ID] || request.query[QUERY_TRACE_ID] || getRandom64()
  }

  buildRequestTags (ctx) {
    return super.buildTags(ctx.req)
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

  createTracer (request): Tracer {
    const traceId = this.getTraceId(request)
    return this.getTraceManager().create({traceId})
  }

  shimmer (options) {
    const self = this
    const traceManager = this.getTraceManager()
    options.app.use(bodyParser())
    options.app.use(traceManager.bind(async function (ctx, next) {
      if (self.requestFilter && !self.requestFilter(ctx)) return await next()

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
