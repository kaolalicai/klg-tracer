import * as sinon from 'sinon'
import {RunUtil} from '../../RunUtil'
import {TraceService} from '../../../src/TraceService'
import {KlgHttpServerPatcher} from '../../../src/patch/HttpServer'
import {HttpClientPatcher} from '../../../src/patch/HttpClient'

const assert = require('assert')

RunUtil.run(function (done) {
  const serverRunSpy = sinon.spy(KlgHttpServerPatcher.prototype, 'run')
  const clinetRunSpy = sinon.spy(HttpClientPatcher.prototype, 'run')
  new TraceService().registerHttpHooks({
    httpServer: {
      requestFilter: function (req) {
        return true
      }
    },
    httpClient: {
      enabled: false
    }
  })
  assert(serverRunSpy.callCount === 1)
  assert(clinetRunSpy.callCount === 0)
  done()
})
