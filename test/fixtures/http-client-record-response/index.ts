import {RunUtil} from '../../RunUtil'
import * as assert from 'assert'
// 放在前面，把 http.ClientRequest 先复写
const nock = require('nock')
import {KlgHttpServerPatcher, KlgHttpClientPatcher} from '../../../src/'

const httpServerPatcher = new KlgHttpServerPatcher({
  recordGetParams: true,
  recordPostData: true
})
const httpClientPatcher = new KlgHttpClientPatcher({
  // nock 复写了 https.request 方法，没有像原始一样调用 http.request，所以需要强制复写
  forceHttps: true,
  recordResponse: true
})

RunUtil.run(function (done) {
  httpServerPatcher.run()
  httpClientPatcher.run()

  const http = require('http')
  const https = require('https')

  process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
    console.log('report', JSON.stringify(report))
    console.log('logs0', report.spans[0].logs)
    console.log('logs1', report.spans[1].logs)
    const spans = report.spans
    assert(spans.length === 2)
    const logs = spans[1].logs
    const fields = logs[0].fields
    assert(fields[0].key === 'response')
    assert(fields[0].value === 'Response from TaoBao.')

    done()
  })

  nock('https://www.taobao.com')
    .get(/.*/)
    .reply(200, 'Response from TaoBao.')

  function request (agent, options) {

    return new Promise((resolve, reject) => {
      const req = agent.request(options, (res) => {
        let data = ''

        res.on('data', (d) => {
          data += d
        })

        res.on('end', () => {
          resolve([res, data])
        })
      })

      req.on('error', (e) => {
        reject(e)
      })

      req.end()
    })
  }

  const server = http.createServer((req, res) => {
    request(https, {
      hostname: 'www.taobao.com',
      path: '/?name=test',
      method: 'GET'
    }).then((response) => {
      res.end('ok')
    })
  })

  server.listen(0, () => {
    const port = server.address().port

    setTimeout(function () {
      request(http, {
        hostname: 'localhost',
        port: port,
        path: '/?aaa=test',
        method: 'GET'
      }).catch((err) => {
        console.log('err: ', err)
      })
    }, 500)
  })
})
