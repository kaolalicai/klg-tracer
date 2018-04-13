import {NORMAL_TRACE, TIMEOUT_TRACE, SLOW_TRACE, ERROR_TRACE} from '../util/Constants'
import * as EventEmitter from 'events'
import * as mixin from 'mixin'
import {Tracer as OpenTrancer} from 'opentracing'

export class Tracer extends (mixin(OpenTrancer, EventEmitter) as { new (): any }) {
  options
  namespace
  startMs = Date.now()
  finishMs = 0
  duration = 0
  status = NORMAL_TRACE
  _finished = false

  private attrs: Map<string, any> = new Map()

  constructor (options: { ns?, traceId? } = {}) {
    super()
    this.options = options
    this.namespace = options.ns
    this.traceId = options.traceId
  }

  setAttr (key, value: any) {
    this.attrs.set(key, value)
  }

  named (name) {
    this.setAttr('name', name)
  }

  get name () {
    return this.getAttr('name') || ''
  }

  get traceId () {
    return this.getAttr('traceId') || ''
  }

  set traceId (traceId) {
    this.setAttr('traceId', traceId)
  }

  getAttr (key) {
    return this.attrs.get(key)
  }

  hasAttr (key) {
    return this.attrs.has(key)
  }

  finish (options = {}) {
    if (this._finished) return
    this.finishMs = Date.now()
    this.duration = this.finishMs - this.startMs
    this._finished = true

    if (options['slowThreshold']) {
      if (this.duration >= options['slowThreshold']) {
        this.setStatus(SLOW_TRACE)
      }
    }
    (this as any).emit('finish', this)
  }

  timeout () {
    this.setStatus(TIMEOUT_TRACE)

    this.finish()
  }

  error () {
    this.setStatus(ERROR_TRACE)
  }

  setStatus (status) {
    this.status = this.status | status
  }

  report () {
    const result = {
      timestamp: this.startMs,
      duration: this.duration,
      status: this.status
    }

    for (let [key, value] of this.attrs.entries()) {
      result[key] = value
    }
    return result
  }
}
