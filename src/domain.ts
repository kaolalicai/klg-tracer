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
  httpServer?: {
    recordGetParams?: boolean,    // 是否记录 query
    recordPostData?: boolean,     // 是否记录 post data
    recordResponse?: boolean,     // 是否记录 response
    requestFilter?: requestFilter,  // 过滤器
    interceptor?: interceptor       // 中间件 TODO
  },
  httpClient?: {
    enabled: boolean, options?: {
      recordGetParams?: boolean,
      recordPostData?: boolean,
      recordResponse?: boolean
    }
  },
  mongodb?: { enabled: boolean, options?: any }
}
