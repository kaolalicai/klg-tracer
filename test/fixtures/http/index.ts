import {RunUtil} from '../../RunUtil'
import * as assert from 'assert'
import * as url from 'url'
import {KlgHttpServerPatcher} from '../../../src/patch/HttpServer'
import {NORMAL_TRACE} from 'pandora-metrics'

const httpServerPatcher = new KlgHttpServerPatcher({
  requestFilter: function (req) {
    const urlParsed = url.parse(req.url, true)
    return urlParsed.pathname.indexOf('ignore') > -1
  }
})

RunUtil.run(function (done) {
  httpServerPatcher.run()
  const http = require('http')
  const urllib = require('urllib')

  process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
    assert(report.name === 'HTTP-GET:/')
    assert(report.spans.length > 0)
    assert(report.status === NORMAL_TRACE)
    console.log('spans', report.spans)
    const span = report.spans[0]
    const tag = span.tags['http.aborted']
    assert(!tag.value)

    done()
  })

  const server = http.createServer((req, res) => {
    res.end('hello')
  })

  server.listen(0, () => {
    const port = server.address().port

    setTimeout(function () {
      // should be ignore
      urllib.request(`http://localhost:${port}/ignore`)
    }, 500)

    setTimeout(function () {
      urllib.request(`http://localhost:${port}`)
    }, 1000)
  })
})
