import {HttpClientPatcher} from './HttpClient'
import {HttpServerPatcher} from './HttpServer'
import * as tracer from 'tracer'
import * as http from 'http'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'

process.env.DEBUG = 'Klg:Tracer:*'

const logger = tracer.console({})
describe('http client hook test', async function () {
  let server
  beforeAll(() => {
    new HttpServerPatcher().shimmer()
    new HttpClientPatcher().shimmer()

    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end(JSON.stringify({msg: 'Hello Pandora.js'}))
    }).listen(4005)
  })

  it(' test query ', async () => {
    new MessageSender().on(MessageConstants.TRACE, data => {
      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()
      expect(data.userId).toBeDefined()
      expect(data.spans).toBeDefined()
      expect(data.spans.length).toEqual(1)
      expect(data.spans[0].name).toEqual('http')
      console.log('data', JSON.stringify(data))
      console.log('span', data.spans[0])

      const tags = data.spans[0].tags
      expect(tags['http.method']).toEqual({value: 'GET', type: 'string'})
      expect(tags['http.url']).toEqual({value: '/hello', type: 'string'})
    })

    const res = await request.get('http://localhost:4005/hello').query({msg: 'hello'})
      .set('X-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end()

    expect.hasAssertions()
    logger.info(res.body)
  })

  afterAll(done => {
    server.close(done)
  })
})
