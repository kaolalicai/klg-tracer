import {IPatcher} from '../domain'
import {hook} from 'module-hook'
import {TraceManager} from '../trace/TraceManager'
import * as shimmer from '../trace/Shimmer'

export abstract class Patcher implements IPatcher {
  options
  hookStore = {}

  constructor (options) {
    this.options = options || {}
  }

  abstract getModuleName (): string

  // abstract getModule (): any

  hook (version: string, reply: (loadModule, replaceSource?, version?) => void) {
    this.hookStore[version] = reply
  }

  run () {
    for (let version in this.hookStore) {
      this.getHook()(this.getModuleName(), version, this.hookStore[version])
    }
  }

  getHook () {
    return hook
  }

  getShimmer () {
    return shimmer
  }

  getTraceManager () {
    return TraceManager.getInstance()
  }
}
