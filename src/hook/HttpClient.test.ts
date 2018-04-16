import {HttpClientPatcher} from './HttpClient'
import {HttpServerPatcher} from './HttpServer'
import {TraceManager} from '../trace/TraceManager'
import * as http from 'http'
import * as nock from 'nock'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'
import {logger} from '../util/Logger'

process.env.DEBUG = 'Klg:Tracer:*'

describe('http client hook test', async function () {
  let traceManager = TraceManager.getInstance()
  let server
  beforeAll(() => {
    new HttpServerPatcher().shimmer()
    new HttpClientPatcher().shimmer()

    nock('http://myapp.com')
      .get(/.*/)
      .reply(200, {
        _id: '123ABC',
        _rev: '946B7D1C',
        username: 'pgte',
        email: 'pedro.teixeira@gmail.com'
      })

    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      const tracer = traceManager.getCurrentTracer()
      tracer.getCurrentSpan()
      // res.end(JSON.stringify({msg: 'hello'}))
      request.get('http://myapp.com').query({msg: 'hello'})
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function (err, response) {
          if (err) console.log('http request err', err)
          res.end(JSON.stringify(response.body))
        })
    }).listen(4005)
  })

  it(' test query ', async () => {
    new MessageSender().on(MessageConstants.TRACE, data => {
      console.log('data', data)
      console.log('span 1', data.spans[1])

      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()
      // expect(data.userId).toBeDefined()
      expect(data.spans).toBeDefined()
      expect(data.spans.length).toEqual(2)
      expect(data.spans[0].name).toEqual('http-server')

      const tags = data.spans[0].tags
      expect(tags['http.method']).toEqual({value: 'GET', type: 'string'})
      expect(tags['http.url']).toEqual({value: '/hello', type: 'string'})
    })

    const res = await request.get('http://localhost:4005/hello').query({msg: 'hello', userId: '123123123'})
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')

    expect.hasAssertions()
    logger.info(res.body)
  })

  afterAll(done => {
    server.close(done)
  })
})
