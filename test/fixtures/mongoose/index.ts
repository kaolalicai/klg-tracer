import {RunUtil} from '../../RunUtil'
import * as assert from 'assert'
import {TraceService} from '../../../src/TraceService'

new TraceService().registerHttpHooks({
  httpClient: {
    enabled: false
  },
  mongodb: {enabled: true}
})

import {User, db} from './UserModel'

RunUtil.run(function (done) {
  const http = require('http')
  const urllib = require('urllib')

  process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (report: any) => {
    assert(report)
    // console.log('spans', report.spans)
    console.log('tags', report.spans[1].tags)
    console.log('tags', report.spans[2].tags)
    console.log('tags', report.spans[3].tags)
    console.log('tags', report.spans[4].tags)
    console.log('tags', report.spans[5].tags)
    assert(report.spans.length > 5)
    done()
  })

  const server = http.createServer((req, res) => {
    // User.findOne({}).then(() => res.end('ok'))
    insertAndQuery().then((() => res.end('ok'))).catch((err) => {
      console.log('mongodb error: ', err)
    })
  })

  async function insertAndQuery () {
    const user = new User({
      phone: '13244667766',
      realName: 'Nick'
    })
    await user.save()
    const fUser = await User.findOne({}).then()
    console.log('fUser', fUser)
    db.close()
  }

  server.listen(0, () => {
    const port = server.address().port

    setTimeout(function () {
      urllib.request(`http://localhost:${port}/?test=query`).catch((err) => {
        console.log('request error: ', err)
      })
    }, 500)
  })
})
