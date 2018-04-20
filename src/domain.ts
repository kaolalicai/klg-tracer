export interface IPatcher {

  getShimmer ()

  getTraceManager ()

  getModuleName ()

}

export interface IReport {
  report (data: TraceData): void
}

export interface SpanData {
  name: string
  references: Array<{
    refType?: string;
    traceId: string;
    spanId: string;
  }>
  context: object
  timestamp: number
  duration: number
  logs: Array<{
    timestamp: string;
    fields: any;
  }>
  tags: object
}

export interface TraceData {
  name: string
  userId?: string
  traceId: string
  status: string
  timestamp: number
  duration: number
  spans: Array<SpanData>
}

export interface TracerReport {
  report ()

  getValue ()
}

export interface HookOptions {
  httpClient?: boolean,
  slowThreshold?: boolean,
  interceptor?: Function
}
