import {mockTracerPromise} from './TracerMock'
import {MongodbPatcher} from './Mongodb'
import {logger} from '../util/Logger'
import {User, db} from './Mongoose.test.helper'

new MongodbPatcher().run()

process.env.DEBUG = 'Klg:Tracer:*'

describe('mongo hook for monoose test', async function () {

  beforeAll((done) => {
    setTimeout(done, 200)
  })

  it(' test mongo insert ', (done) => {
    mockTracerPromise(async function (rootTracer, traceManager) {

      const user = new User({phone: '132', realName: 'nick'})
      await user.save()
      logger.info('user', user)

      const fUser = await User.findOne({phone: '132'})
      logger.info('fUser', fUser)

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
    })
  })

  afterAll(done => {
    db.close(done)
  })
})
