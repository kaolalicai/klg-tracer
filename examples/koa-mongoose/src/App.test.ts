import {app} from './App'
import * as supertest from 'supertest'

describe('koa test', async function () {

  const server = app.listen(3008)
  const request = supertest.agent(server)

  it(' get query ', async () => {
    const query = {a: 1, b: 3, c: 'sssss'}
    const result = await request.get('/api/v1/hello').query(query).expect({msg: 'hello world'})
    console.log('result', result)
  })
})
