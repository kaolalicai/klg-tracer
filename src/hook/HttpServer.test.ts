import {HttpServerPatcher} from './HttpServer'
import * as http from 'http'
import * as tracer from 'tracer'
import {Request} from 'klg-request'
import {MessageConstants, MessageSender} from '../util/MessageSender'

process.env.DEBUG = 'Klg:Tracer:*'

const logger = tracer.console({})
const request = new Request()
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
      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()
      expect(data.userId).toBeDefined()
      console.log('data', data)
    })
    const result = await request.postJSON({
      url: 'http://localhost:4005/',
      userId: '1212',
      requestId: '123123',
      body: {msg: 'hello'}
    })
    expect.hasAssertions()
    logger.info(result)
  })

  afterAll(done => {
    server.close(done)
  })
})
