# klg-tracer

链路追踪工具，base on [pandora](https://github.com/midwayjs/pandora)

## Installation

```bash
npm install klg-tracer
```

Node.js >= 8.2.1 required.

## Features

Pandora 提供基于 OpenTracing 标准的链路追踪信息，在此基础上，klg-tracer 自定义了一些 tags，并支持将 tracer 信息写入 mongo。

## QuickStart

### 配合 Pandora 使用，纯粹拓展 tags

TODO
1. export 拓展好的类
2. 覆盖 Pandora 的默认配置

### 将 tracer 结果写入 Mongo

app.ts
```js
import {TraceService, Tracer} from 'klg-tracer'
const traceService = new TraceService()

// 注册钩子
traceService.registerHooks()

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

```js
{
    "_id" : ObjectId("5ad99bd3f29cf14de64516b3"),
    "tags" : {
        "httpMethod" : "POST",
        "url" : "/api/v1/account/register",
        "data" : {
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

### Tracer tags

1. http server
- http.method
- http.path  // path
- http.query    // query string
- http.data  // post body, only json
- http.response

2. http client
- http.method
- http.url  // path
- http.hostname  // send to where
- http.port
- http.query
- http.data
- http.response
- http.response_size
- http.status_code
- http.error_code

3. mongo
todo

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

http-client : hack http request method, register listener.

## ChangeLog

3.0.0
- 基于 Pandorajs 重做，目前只提供 http-server http-client mongo 三个位置的监听

1.2.0
- koa-server hook add requestFilter options

1.1.0
- koa-server hook add intercept options

1.0.3
- http-client hook trace request parameters and response

1.0.0
- add http-server koa-server hook
- add http-client hook
- add mongo report

## 常见问题
1 thenable 函数会 break cls 的上下文，像 mongoose 和 superagent 都是在 prototype 里添加 then function 来支持 Promise 的，所有都会有这个问题。
目前只能通过改变写法来避免这个问题，例如：

break session
```js
await User.findOne({})
```

work
```js
await User.findOne({}).then()
```

详情见此 issue https://github.com/midwayjs/pandora/issues/221

2 mongodb nodejs driver 3.0 版本升级了 apm 的实现，Pandorajs 还未支持
详情见此 issue https://github.com/midwayjs/pandora/issues/239