import {HttpClientPatcher} from './HttpClient'
import {KlgHttpServerPatcher} from './HttpServer'
import * as http from 'http'
import * as nock from 'nock'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'
import {logger} from '../util/Logger'

process.env.DEBUG = 'Klg:Tracer:*'

describe('http client hook test', async function () {
  let server
  let fakeResult = {
    _id: '123ABC',
    _rev: '946B7D1C',
    username: 'pgte',
    email: 'pedro.teixeira@gmail.com'
  }
  beforeAll(() => {
    new KlgHttpServerPatcher({})
    new HttpClientPatcher().shimmer()

    nock('http://myapp.com')
      .get(/.*/)
      .reply(200, fakeResult)

    nock('http://myapp.com')
      .post(/.*/)
      .reply(200, fakeResult)

    server = http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/plain'})
      // query
      request.get('http://myapp.com').query({msg: 'hello'})
        .set('Accept', 'application/json')
        .end(function (err, response) {
          if (err) console.log('http request query err', err)

          // post
          request.post('http://myapp.com').send({msg: 'hello'})
            .end(function (err, response2) {
              if (err) console.log('http request  post err', err)
              res.end(JSON.stringify(response.body))
            })
        })
    }).listen(4005)
  })

  it(' test query ', async () => {

    new MessageSender().once(MessageConstants.TRACE, data => {
      console.log('data', data)
      console.log('span 0', data.spans[0].tags)
      console.log('span 1', data.spans[1].tags)
      console.log('span 2', data.spans[2].tags)

      expect(data.timestamp).toBeDefined()
      expect(data.duration).toBeDefined()
      expect(data.status).toBeDefined()
      expect(data.traceId).toBeDefined()
      // expect(data.userId).toBeDefined()
      expect(data.spans).toBeDefined()
      expect(data.spans.length).toEqual(3)
      expect(data.spans[0].name).toEqual('http-server')

      const tags0 = data.spans[0].tags
      expect(tags0['http.method']).toEqual({value: 'GET', type: 'string'})
      expect(tags0['http.url']).toEqual({value: '/hello', type: 'string'})

      const tags1 = data.spans[1].tags
      expect(tags1['http.method']).toEqual({value: 'GET', type: 'string'})
      expect(tags1['http.hostname'].value).toEqual('myapp.com')
      expect(tags1['http.path'].value).toEqual('/?msg=hello')
      expect(tags1['http.port'].value).toEqual(80)
      expect(tags1['http.status_code'].value).toEqual(200)
      expect(tags1['http.response'].value).toEqual(fakeResult)

      const tags2 = data.spans[2].tags
      expect(tags2['http.method']).toEqual({value: 'POST', type: 'string'})
      expect(tags2['http.hostname'].value).toEqual('myapp.com')
      expect(tags2['http.path'].value).toEqual('/')
      expect(tags2['http.port'].value).toEqual(80)
      expect(tags2['http.status_code'].value).toEqual(200)
      expect(tags2['http.body'].value).toEqual({msg: 'hello'})
      expect(tags2['http.response'].value).toEqual(fakeResult)
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
