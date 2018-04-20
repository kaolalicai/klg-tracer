import * as http from 'http'
import * as Koa from 'koa'
import * as tracer from 'tracer'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'
import {Tracer} from '../trace/Tracer'
import {KoaServerPatcher} from './KoaServer'

process.env.DEBUG = 'Klg:Tracer:*'

const logger = tracer.console({})
describe('koa server hook test', async function () {
  let server

  beforeAll(done => {
    const app = new Koa()
    new KoaServerPatcher(app, {
      interceptor: function (ctx, trace: Tracer) {
        ctx.traceId = trace.traceId
        ctx.userId = trace.traceId
      }
    }).shimmer()
    app.use(async (ctx, next) => {
      ctx.body = 'hello world'
    })
    server = http.createServer(app.callback()).listen(4005)
    done()
  })

  it(' test query  ', async () => {
    const query = {
      userId: '1212',
      traceId: '123123029387293467239847'
    }
    new MessageSender().once(MessageConstants.TRACE, data => {
      console.log('data', data)
      console.log('span 0', data.spans[0].tags)
      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toEqual(query.traceId)

      const tags = data.spans[0].tags
      expect(tags['http.method'].value).toEqual('GET')
      expect(tags['http.url'].value).toEqual('/233')
      expect(tags['http.query'].value).toEqual(query)
      expect(tags['http.body'].value).toEqual({})
      expect(tags['http.res.status'].value).toEqual(200)
      expect(tags['http.response'].value).toEqual('hello world')
    })

    const result = await request.get('http://localhost:4005/233').query(query)
    expect.hasAssertions()
    logger.info(result.text)
  })

  it(' test post  ', async () => {
    const body = {
      userId: '1212',
      requestId: '123123',
      body: {msg: 'hello'}
    }
    new MessageSender().once(MessageConstants.TRACE, data => {
      console.log('data', data)
      console.log('span 0', data.spans[0].tags)
      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()

      const tags = data.spans[0].tags
      expect(tags['http.method'].value).toEqual('POST')
      expect(tags['http.url'].value).toEqual('/233')
      expect(tags['http.query'].value).toEqual({})
      expect(tags['http.body'].value).toEqual(body)
      expect(tags['http.res.status'].value).toEqual(200)
      expect(tags['http.response'].value).toEqual('hello world')
    })
    const result = await request.post('http://localhost:4005/233').send(body)
    expect.hasAssertions()
    logger.info(result.text)
  })

  afterAll(done => {
    server.close(done)
  })
})
