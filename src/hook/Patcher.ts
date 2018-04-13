import {IPatcher} from './IPatcher'
import {TraceManager} from '../trace/TraceManager'

export abstract class Patcher implements IPatcher {
  abstract getModuleName (): string

  abstract getModule (): any

  getTraceManager () {
    return TraceManager.getInstance()
  }
}
