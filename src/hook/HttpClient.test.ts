import {HttpClientPatcher} from './HttpClinet'
import * as tracer from 'tracer'
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
    traceManager.run(function () {
      traceManager.create({traceId: '1231231231231231231'})
      request.get('www.baidu.com').query({msg: 'hello'})
        .set('X-API-Key', 'foobar')
        .set('Accept', 'application/json')
        .end(function (res) {
          if (res.ok) {
            logger.info('yay got ' + JSON.stringify(res.body))
          } else {
            logger.info('Oh no! error ' + res.text)
          }
          done()
        })
    })
  })
})
