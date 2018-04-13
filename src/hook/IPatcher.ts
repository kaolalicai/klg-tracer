import {TraceManager} from '../trace/TraceManager'

export interface IPatcher {
  getTraceManager (): TraceManager

  getModule (): any

  getModuleName (): string
}
