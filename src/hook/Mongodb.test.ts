import {mockTracer} from './TracerMock'
import {MongodbPatcher} from './Mongodb'
import {logger} from '../util/Logger'
import * as mongodb from 'mongodb'

new MongodbPatcher().run()

process.env.DEBUG = 'Klg:Tracer:*'

describe('mongo hook test', async function () {
  let db

  beforeAll((done) => {
    const url = 'mongodb://joda:27017/test'
    mongodb.MongoClient.connect(url, function (err, client) {
      db = client.db()
      done(err)
    })
  })

  it(' test mongo insert ', (done) => {

    require('mongodb')
    const Docs = db.collection('documents')
    mockTracer(function (rootTracer, traceManager) {
      const docs = [{a: 1}, {a: 2}, {a: 3}]
      Docs.insertMany(docs, function (err, result) {
        logger.info(err, result)
        const tracer = traceManager.getCurrentTracer()
        logger.info('tracer', tracer)
        expect(tracer).toBeDefined()
        expect(tracer.spans).toBeDefined()
        // 0 start 1 insert 2 next
        expect(tracer.spans.length).toEqual(3)

        const span1 = tracer.spans[1]
        logger.info('span1', span1)

        const span2 = tracer.spans[2]
        logger.info('span2', span2)
        done(err)
      })
    })
  })

  afterAll(done => {
    db.close(done)
  })
})
