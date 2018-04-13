import * as http from 'http'
import {MongoReport} from './MongoReport'

process.env.DEBUG = 'Klg:Tracer:*'

describe('http client hook test', async function () {
  it(' test transData ', async () => {

    const spy = jest.spyOn(MongoReport.prototype, 'initDb')
    const data = {
      'timestamp': 1523608674049,
      'duration': 4,
      'spans': [{
        'name': 'http',
        'timestamp': 1523608674050,
        'duration': 3,
        'context': {'traceId': '0ce4b7548f966064', 'spanId': '039b82acd349f2f4'},
        'references': [],
        'tags': {
          'http.method': {'value': 'GET', 'type': 'string'},
          'http.url': {'value': '/hello', 'type': 'string'},
          'http.client': {'value': false, 'type': 'bool'}
        },
        'logs': []
      }],
      'status': 1,
      'traceId': '0ce4b7548f966064',
      'userId': '122000'
    }
    const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
    reporter.crud = {
      save: async () => {
        // empty
      }
    } as any
    const spySave = jest.spyOn(reporter.crud, 'save')
    await reporter.report(data)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spySave).toHaveBeenCalledTimes(1)
  })
})
