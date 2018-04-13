const TRACEID = 'traceId'
import {Tracer} from './Tracer'
import {MessageConstants, MessageSender} from '../util/MessageSender'
import {TRACER_TIMEOUT} from '../util/Constants'
import * as cls from 'cls-hooked'
import * as uuid from 'uuid'

const debug = require('debug')('Klg:Tracer:TraceManager')

export class TraceManager {
  private static instance
  traceContainer = {}
  ns = cls.createNamespace('klg_tracer')
  sender = new MessageSender()

  constructor () {
    this.timeoutCheck()
  }

  static getInstance (): TraceManager {
    if (!this.instance) {
      this.instance = new TraceManager()
    }
    return this.instance
  }

  getTimeout () {
    return TRACER_TIMEOUT
  }

  timeoutCheck () {
    // todo
  }

  getCurrentTracer () {
    const traceId = this.ns.get(TRACEID)
    if (traceId) {
      return this.traceContainer[traceId]
    }
  }

  getTracer (traceId) {
    return this.traceContainer[traceId]
  }

  create (options: {
    traceId?,
    ns?
  } = {}): Tracer {
    try {
      options.traceId = options.traceId || uuid()
      const traceId = options.traceId
      this.ns.set(TRACEID, traceId)
      options.ns = this.ns
      const tracer = new Tracer(options)
      this.traceContainer[traceId] = tracer;
      (tracer as any).once('finish', () => {
        this.report(tracer)
        this.removeTracer(traceId)
      })
      return tracer
    } catch (error) {
      debug('create trace error.', error)
      return null
    }
  }

  report (tracer) {
    this.sender.send(MessageConstants.TRACE, tracer.report())
  }

  removeTracer (traceId) {
    if (this.traceContainer[traceId]) {
      this.traceContainer[traceId] = null
      delete this.traceContainer[traceId]
    }
  }

  bind (fn, context?) {
    return this.ns.bind(fn, context)
  }

  run (fn, context?) {
    return this.ns.run(fn, context)
  }

  bindEmitter (emitter) {
    return this.ns.bindEmitter(emitter)
  }

  get namespace () {
    return this.ns
  }

}
