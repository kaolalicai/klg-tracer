import {TraceService} from './TraceService'
import {HttpServerPatcher} from './hook/HttpServer'
import {HttpClientPatcher} from './hook/HttpClient'

jest.mock('./hook/HttpServer')
jest.mock('./hook/HttpClient')

process.env.DEBUG = 'Klg:Tracer:*'

describe('TraceService test', async function () {
  it(' register and report ', async () => {
    const traceService = new TraceService()
    traceService.registerHttpHooks()
    traceService.registerMongoReporter({mongoUrl: 'mongodb://joda:27017/beta'})

    expect(HttpServerPatcher.prototype.shimmer).toHaveBeenCalled()
    expect(HttpClientPatcher.prototype.shimmer).toHaveBeenCalled()
  })
})
