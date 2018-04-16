import * as http from 'http'
import {MongoReport} from './MongoReport'
import {tracer} from './MongoReport.test.data'

process.env.DEBUG = 'Klg:Tracer:*'

describe('http client hook test', async function () {
  it(' test transData ', async () => {

    jest.spyOn(MongoReport.prototype, 'initDb')
    const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
    const plans = reporter.transData(tracer)
    expect(plans).toBeDefined()
    expect(plans.length).toEqual(3)
  })

  it.skip(' test transData ', async () => {

    const spy = jest.spyOn(MongoReport.prototype, 'initDb')
    const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
    reporter.crud = {
      save: async () => {
        // empty
      }
    } as any
    const spySave = jest.spyOn(reporter.crud, 'save')
    await reporter.report(tracer)

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spySave).toHaveBeenCalledTimes(1)
  })
})
