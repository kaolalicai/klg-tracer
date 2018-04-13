import {IPatcher} from './IPatcher'
import {TraceManager} from '../trace/TraceManager'
import * as shimmer from '../trace/Shimmer'

export abstract class Patcher implements IPatcher {
  options

  constructor (options) {
    this.options = options || {}
  }

  abstract getModuleName (): string

  abstract getModule (): any

  getShimmer () {
    return shimmer
  }

  getTraceManager () {
    return TraceManager.getInstance()
  }
}
