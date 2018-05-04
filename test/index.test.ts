const path = require('path')
const childProcess = require('child_process')

const fork = function (name, done) {
  const filePath = require.resolve(path.join(__dirname, `fixtures/${name}`))
  const worker = childProcess.fork(filePath, {
    env: {
      ...process.env,
      NODE_ENV: 'test'
    },
    execArgv: [
      '-r', 'ts-node/register',
      '-r', 'nyc-ts-patch',
      '-r', path.join(__dirname, './TestHelper.ts')
    ]
  })
  worker.on('message', (data) => {
    if (data === 'done') {
      worker.kill()
      done()
    }
  })
}

describe('unit test', () => {

  describe('http server', () => {
    it('should normal trace record', done => {
      fork('http', done)
    })

    it('should record http post data and query params', done => {
      fork('http-record-query-and-data', done)
    })
  })

})
