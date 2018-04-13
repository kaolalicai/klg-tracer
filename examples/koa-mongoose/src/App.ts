import * as Koa from 'koa'
import {User} from './UserModel'
import * as tracer from 'tracer'
import {Request} from 'klg-request'

const request = new Request()
const logger = tracer.console()

const app = new Koa()

app.use(async (ctx, next) => {
  logger.log(1)
  ctx.body = await d1()
})

async function d1 () {
  logger.log(2)
  await request.postJSON({
    url: 'www.baidu.com',
    userId: '23334',
    requestId: '123123123',
    body: {
      msg: 'hello'
    }
  })
  return await d2()
}

async function d2 () {
  logger.log(3)
  const user = await User.findOne()
  logger.log('hello')
  logger.log('user:', user)
  return user
}

export {app}
