import * as MockMongoServer from 'mongodb-mock-server'
import {MongodbPatcher} from '../src/patch/Mongodb'
import * as assert from 'assert'
import {HttpServerPatcher} from '../src/patch/HttpServer'

const httpServerPatcher = new HttpServerPatcher()
const mongodbPatcher = new MongodbPatcher()

describe('mongo test', () => {

  describe('mongoose', function () {
    let server
    let mongoServer

    before(() => {
      MockMongoServer.createServer(40001).then(_server => {
        mongoServer = _server

        mongoServer.setMessageHandler(request => {
          const doc = request.document
          if (doc.ismaster) {
            request.reply(MockMongoServer.DEFAULT_ISMASTER_36)
          } else if (doc.insert) {
            request.reply({ok: 1, operationTime: Date.now()})
          } else if (doc.find) {
            request.reply({ok: 1})
          } else if (doc.endSessions) {
            request.reply({ok: 1})
          }
        })
      })
    })

    it('should mongoose work ok', done => {
      httpServerPatcher.run()
      mongodbPatcher.run()

      const http = require('http')
      const urllib = require('urllib')
      const mongodb = require('mongodb')

      process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
        assert(report)
        console.log('spans', report.spans)
        assert(report.spans.length > 4)
        done()
      })

      server = http.createServer((req, res) => {
        mongodb.connect('mongodb://127.0.0.1:40001/test', (err, client) => {
          const coll = client.db('foo').collection('bar')

          return coll
            .insert({a: 42})
            .then(() => coll.findOne({}, {readConcern: {level: 'majority'}}))
            .then(() => {
              res.end('ok')
              return client.close()
            }).catch((err) => {
              console.log('mongodb error: ', err)
            })
        })
      })

      server.listen(0, () => {
        const port = server.address().port

        setTimeout(function () {
          urllib.request(`http://localhost:${port}/?test=query`).catch((err) => {
            console.log('request error: ', err)
          })
        }, 500)
      })
    })

    after(() => {
      MockMongoServer.cleanup()
      server.close()
    })

  })
})
