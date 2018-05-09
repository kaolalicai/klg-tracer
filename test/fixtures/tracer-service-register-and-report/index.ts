import * as sinon from 'sinon'
import {RunUtil} from '../../RunUtil'
import {TraceService} from '../../../src/TraceService'
import {KlgHttpServerPatcher} from '../../../src/patch/HttpServer'
import {KlgHttpClientPatcher} from '../../../src/patch/HttpClient'
import {MongoReport} from '../../../src/report/MongoReport'

const assert = require('assert')

RunUtil.run(function (done) {
  const serverRunSpy = sinon.spy(KlgHttpServerPatcher.prototype, 'run')
  const clientRunSpy = sinon.spy(KlgHttpClientPatcher.prototype, 'run')
  const initDbSpy = sinon.spy(MongoReport.prototype, 'initDb')
  new TraceService().registerHooks({
    httpServer: {
      requestFilter: function (req) {
        return true
      }
    },
    httpClient: {
      enabled: false
    }
  }).registerMongoReporter({mongoUrl: 'mongodb://127.0.0.1:40001/test'})
  assert(serverRunSpy.callCount === 1)
  assert(clientRunSpy.callCount === 0)
  assert(initDbSpy.callCount === 1)
  done()
})
