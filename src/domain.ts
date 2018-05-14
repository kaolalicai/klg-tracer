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
export declare type interceptor = (ctx, tracer, span) => void

export interface HttpHookOptions {
  recordGetParams?: boolean,    // 是否记录 query
  recordPostData?: boolean,     // 是否记录 post data
  recordResponse?: boolean     // 是否记录 response
}

export interface HttpServerHookOptions extends HttpHookOptions {
  useKoa?: boolean,    // 在 Koa 这一层监听，BUG 会更少，因为 koa 对 query 和 body 的处理更完善
  requestFilter?: requestFilter,  // 过滤器
  interceptor?: interceptor       // 中间件
}

export interface EnableOptions<T> {
  enabled: boolean,
  options?: T
}

export interface HttpClientHookOptions extends HttpHookOptions {

}

export interface TracerOptions {
  httpServer?: HttpServerHookOptions,
  httpClient?: EnableOptions<HttpClientHookOptions>,
  mongodb?: EnableOptions<any>
}
