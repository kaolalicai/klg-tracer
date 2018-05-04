import {RunUtil} from '../../RunUtil'
import * as assert from 'assert'
import {KoaServerPatcher} from '../../../src/patch/KoaServer'
import {NORMAL_TRACE} from 'pandora-metrics'

RunUtil.run(function (done) {
  const http = require('http')
  const Koa = require('koa')
  const urllib = require('urllib')
  const app = new Koa()

  const koaServerPatcher = new KoaServerPatcher({
    app: app,
    requestFilter: (ctx) => {
      return ctx.url.indexOf('ignore') > -1
    }
  })
  koaServerPatcher.run()

  process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
    assert(report.name === 'HTTP-GET:/')
    assert(report.spans.length > 0)
    assert(report.status === NORMAL_TRACE)
    const span = report.spans[0]
    const tag = span.tags['http.aborted']
    assert(!tag.value)

    done()
  })

  app.use(async (ctx, next) => {
    console.log('hello world')
    ctx.body = 'hello world'
  })

  const server = http.createServer(app.callback()).listen(0)

  const port = server.address().port

  setTimeout(function () {
    // should be ignore
    urllib.request(`http://localhost:${port}/ignore`)
  }, 500)

  setTimeout(function () {
    urllib.request(`http://localhost:${port}`)
  }, 1000)
})
