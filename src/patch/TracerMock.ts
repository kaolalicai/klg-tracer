import {TraceManager} from '../trace/TraceManager'

export function mockTracer (callback) {
  const traceManager = TraceManager.getInstance()
  traceManager.run(function () {
    const tracer = traceManager.create()
    const span = tracer.startSpan('test-start', {
      traceId: tracer.traceId
    })
    tracer.named('test')
    tracer.setCurrentSpan(span)
    callback(tracer, traceManager)
  })
}

export function mockTracerPromise (callback) {
  const traceManager = TraceManager.getInstance()
  traceManager.run(function () {
    const tracer = traceManager.create()
    const span = tracer.startSpan('test-start', {
      traceId: tracer.traceId
    })
    tracer.named('test')
    tracer.setCurrentSpan(span)
    callback(tracer, traceManager).then()
  })
}
