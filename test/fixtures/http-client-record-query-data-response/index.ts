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
  recordGetParams: true,
  recordPostData: true,
  recordResponse: true
})

RunUtil.run(function (done) {
  httpServerPatcher.run()
  httpClientPatcher.run()

  const http = require('http')
  const urllib = require('urllib')

  process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
    console.log('report', JSON.stringify(report))

    // client
    const logs = report.spans[1].logs
    console.log('logs', logs)

    const getFields = logs[0].fields
    console.log('getFields', getFields)

    const postFields = logs[1].fields
    console.log('postFields', postFields)

    const responseFields = logs[2].fields
    console.log('responseFields', responseFields)

    assert(logs.length === 3)

    assert(getFields[0].key === 'query')
    assert.deepEqual(getFields[0].value, {name: 'abb'})

    assert(postFields[0].key === 'data')
    assert.deepEqual(postFields[0].value, {age: 100})

    assert(responseFields[0].key === 'response')
    assert(responseFields[0].value === 'Response from TaoBao.')

    done()
  })

  nock('https://www.taobao.com')
    .post(/.*/)
    .reply(200, 'Response from TaoBao.')

  const server = http.createServer((req, res) => {
    urllib.request(`https://www.taobao.com/?name=abb`, {
      method: 'post',
      data: {
        age: 100
      }
    })
    req.on('end', () => {
      res.end(JSON.stringify({name: 'ab', msg: 'hello'}))
    })
  })

  server.listen(0, () => {
    const port = server.address().port

    setTimeout(function () {
      urllib.request(`http://localhost:${port}/?name=test`, {
        method: 'post',
        data: {
          age: 100
        }
      })
    }, 1000)
  })
})
