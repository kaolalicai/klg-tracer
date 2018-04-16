import {MongoReport} from './MongoReport'
import {tracer} from './MongoReport.test.data'

process.env.DEBUG = 'Klg:Tracer:*'

describe('http client hook test', async function () {
  it(' test transData ', async () => {

    jest.spyOn(MongoReport.prototype, 'initDb')
    const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
    const tracers = reporter.transData(tracer)

    console.log('tracers', tracers)
    console.log('tracers tags', tracers[0].tags)
    expect(tracers).toBeDefined()
    expect(tracers.length).toEqual(3)
  })

  it(' test report ', async () => {

    const spy = jest.spyOn(MongoReport.prototype, 'initDb')
    const reporter = new MongoReport({mongoUrl: 'mongodb://joda:27017/beta'})
    reporter.crud = {
      patchSave: async () => {
        // empty
      }
    } as any
    const spySave = jest.spyOn(reporter.crud, 'patchSave')
    await reporter.report(tracer)

    expect(spy).toHaveBeenCalledTimes(2)
    expect(spySave).toHaveBeenCalledTimes(1)
  })
})
