import {HttpServerPatcher} from './HttpServer'
import * as http from 'http'
import * as tracer from 'tracer'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'

process.env.DEBUG = 'Klg:Tracer:*'

const logger = tracer.console({})
describe('http server hook test', async function () {
  let server

  beforeAll(done => {
    new HttpServerPatcher().shimmer()

    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      res.end(JSON.stringify({msg: 'Hello Pandora.js'}))
    }).listen(4005)
    done()
  })

  it(' test wrap', async () => {
    new MessageSender().on(MessageConstants.TRACE, data => {
      console.log('data', data)
      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()
      // expect(data.userId).toBeDefined()
    })
    const result = await request.post('http://localhost:4005/').send({
      userId: '1212',
      requestId: '123123',
      body: {msg: 'hello'}
    })
    expect.hasAssertions()
    logger.info(result.text)
  })

  afterAll(done => {
    server.close(done)
  })
})
