import {RunUtil} from '../../RunUtil'
import * as assert from 'power-assert'
import * as sinon from 'sinon'
import {MongoReport} from '../../../src/report/MongoReport'
import {tracer} from './data'

RunUtil.run(function (done) {

  const spy1 = sinon.spy(MongoReport.prototype, 'initDb')
  const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
  const tracers = reporter.transData(tracer)

  console.log('tracers', tracers)
  console.log('tracers tags', tracers[0].tags)
  assert(tracers !== undefined)
  assert(tracers.length === 3)
  assert(tracers.length === 3)
  assert(tracers[0].traceId)
  assert(tracers[0].tags)
  assert(spy1.calledOnce)

  const spySave = sinon.spy()
  reporter.crud = {
    patchSave: async (args) => {
      spySave(args)
    }
  } as any
  reporter.report(tracer).then(() => {
    assert(spySave.calledOnce)
    const args = spySave.getCall(0).args[0]
    console.log('args', args)
    assert(args.length === 3)
    done()
  }).catch(done)

})
