import * as sinon from 'sinon'
import {RunUtil} from '../../RunUtil'
import {TraceService} from '../../../src/TraceService'
import {KlgHttpServerPatcher} from '../../../src/patch/HttpServer'
import {KlgHttpClientPatcher} from '../../../src/patch/HttpClient'

const assert = require('assert')

RunUtil.run(function (done) {
  const serverRunSpy = sinon.spy(KlgHttpServerPatcher.prototype, 'run')
  const clientRunSpy = sinon.spy(KlgHttpClientPatcher.prototype, 'run')
  new TraceService().registerHooks({
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
  assert(clientRunSpy.callCount === 0)
  done()
})
