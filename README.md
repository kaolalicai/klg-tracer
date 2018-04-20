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

app.ts
```js
const traceService = new TraceService()

// 注册钩子
traceService.registerHttpHooks()

```

### Store tracer data to mongodb

app.ts
```js

// persist tracer to mongodb, collection's name default is 'Tracer'
traceService.registerMongoReporter({
    mongoUrl: 'mongodb:localhost:3306/tracer',
    collectionName: 'Tracer'
})

```

启动你的 Web 服务并访问，相关的请求信息将会写入 Tracer 表中。

Search:

```js
﻿db.Tracer.find({name : 'http-server'}).sort({_id : -1})
```

Result:

```json
{
    "_id" : ObjectId("5ad99bd3f29cf14de64516b3"),
    "tags" : {
        "httpMethod" : "POST",
        "url" : "/api/v1/account/register",
        "body" : {
            "userId" : "5527da927855af35354c39eb",
            "userRole" : "INVESTOR"
        },
        "response" : {
            "code" : 0,
            "message" : "success",
            "data" : {
                "html" : "html"
            }
        }
    },
    "traceId" : "6e11fe95c2035a7a",
    "name" : "http-server",
    "timestamp" : 1524210643694.0,
    "duration" : 152,
    "createdAt" : ISODate("2018-04-20T07:50:43.874Z"),
    "updatedAt" : ISODate("2018-04-20T07:50:43.874Z"),
    "__v" : 0
}
```

### Store tracer daa to web ui

TODO

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

## How it works

### tracer

implements session with [async_hooks](https://nodejs.org/api/async_hooks.html) and [cls-hooked](https://github.com/Jeff-Lewis/cls-hooked)

### hook

serve : hack http createServer method, register listener.

client : hack http request method, register listener.

## ChangeLog
1.0.0
- add http-server koa-server hook
- add http-client hook
- add mongo report

1.0.3
- http-client hook trace request parameters and response


1.1.0
- koa-server hook add intercept options