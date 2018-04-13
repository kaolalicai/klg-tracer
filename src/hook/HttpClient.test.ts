import {HttpClientPatcher} from './HttpClinet'
import * as tracer from 'tracer'
import * as nock from 'nock'
import * as request from 'superagent'
import {MessageConstants, MessageSender} from '../util/MessageSender'
import {TraceManager} from '../trace/TraceManager'

process.env.DEBUG = 'Klg:Tracer:*'

const logger = tracer.console({})
describe('http client hook test', async function () {
  const traceManager = TraceManager.getInstance()
  beforeAll(() => {
    new HttpClientPatcher().shimmer()
  })

  it(' test query ', (done) => {
    nock('http://localhost:40001')
      .get(/.*/)
      .reply(200, {
        _id: '123ABC',
        _rev: '946B7D1C',
        username: 'pgte',
        email: 'pedro.teixeira@gmail.com'
      })

    traceManager.run(function () {
      traceManager.create({traceId: '1231231231231231231'})
      request.get('http://localhost:40001/hello').query({msg: 'hello'})
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function (err, res) {
          if (res) {
            logger.info('yay got ' + JSON.stringify(res.body))
          } else {
            logger.info('Oh no! error ' + err)
          }
          done()
        })
    })
  })
})
