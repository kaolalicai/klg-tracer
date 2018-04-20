# klg-tracer

fork from pandora-metrics and pandora-hook，there are a part of [pandora](https://github.com/midwayjs/pandora)
## Installation

```bash
npm install klg-tracer
```
Node.js >= 8.2.1 required.

## Features

Provide Metrics and Standard OpenTracing Implementation

提供基于 OpenTracing 标准的链路追踪信息

## QuickStart

### Register in koa server

app.ts
```js
import {TraceService, Tracer} from 'klg-tracer'

// 不能放在 koa-router 后面，不然会导致 hook 失效，原因未知
// can't not behind the koa-router
const traceService = new TraceService()

// 注册钩子
traceService.registerKoaHooks(app, {
  // interceptor 的作用是方便业务方把 tracer 和实际业务关联起来，例如，可以把 traceId 写入 ctx
  // 把实际业务的的 userId 写入 trace，方便关联查询
  interceptor: function (ctx, trace: Tracer) {
    ctx.traceId = trace.traceId
    const params = {} as any
    Object.assign(params, ctx.request.body, ctx.request.query, ctx.params)
    const userId = params.userId || ''
    trace.setAttr('userId', userId)
  }
})

```

### Register in http server
如果你没有使用 Koa，那么可以使用通用的 http 钩子，但是 tracer 将不会记录请求参数和返回内容这些 tags

```js
const traceService = new TraceService()

// 注册钩子
traceService.registerHttpHooks()

```

### Store tracer data to mongodb

```js

// persist tracer to mongodb, collection's name default is 'Tracer'
traceService.registerMongoReporter({
    mongoUrl: 'mongodb:localhost:3306/tracer',
    collectionName: 'Tracer'
})

```

### Store tracer daa to web ui

TODO

```js

```

### Tracer tags

1. koa server
- http.method
- http.url  // path
- http.query  // query string
- http.body  // post body, only json
- http.status
- http.response

2. http server
- http.method
- http.url  // path
- http.query

3. http client
- http.method
- http.url  // path
- http.hostname  // send to where
- http.port
- http.query
- http.body
- http.response
- http.response_size
- http.status_code
- http.error_code

## Test

```bash
$ npm i
$ npm test
```

## ChangeLog
1.0.0
- add http-server koa-server hook
- add http-client hook
- add mongo report

1.0.3
- http-client hook trace request parameters and response


1.1.0
- koa-server hook add intercept options