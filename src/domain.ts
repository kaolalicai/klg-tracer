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
    timestamp: number;
    fields: any;
  }>
  tags: object
}

export interface TraceData {
  name: string
  userId?: string
  traceId: string
  status: number
  timestamp: number
  duration: number
  spans: Array<SpanData>
}

export interface TracerReport {
  report ()

  getValue ()
}

export declare type requestFilter = (req) => boolean
export declare type interceptor = (ctx, tracer) => void

export interface ServerHookOptions {
  app?: any,
  requestFilter?: requestFilter,
  interceptor?: interceptor
}

export interface ServerHookOptions {
  httpServer?: ServerHookOptions,
  httpClient?: { enabled: boolean, options?: any },
  mongodb?: { enabled: boolean, options?: any }
}
