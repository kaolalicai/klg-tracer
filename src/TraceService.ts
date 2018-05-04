import * as _ from 'lodash'
import {KlgHttpServerPatcher} from './patch/HttpServer'
import {KoaServerPatcher} from './patch/KoaServer'
import {HttpClientPatcher} from './patch/HttpClient'
import {MongoReportOption, MongoReport} from './report/MongoReport'
import {MessageConstants, MessageSender} from './util/MessageSender'
import {logger} from './util/Logger'
import {HookOptions} from './domain'

const defaultOptions = {httpClient: true, slowThreshold: true}

export class TraceService {
  registerHttpHooks (options: HookOptions = defaultOptions) {
    _.defaults(options, defaultOptions)
    new KlgHttpServerPatcher({})
    if (options.httpClient) new HttpClientPatcher().shimmer()
  }

  registerKoaHooks (app, options: HookOptions = defaultOptions) {
    _.defaults(options, defaultOptions)
    new KoaServerPatcher(app, options).shimmer()
    if (options.httpClient) new HttpClientPatcher().shimmer()
  }

  registerMongoReporter (options: MongoReportOption) {
    new MessageSender().on(MessageConstants.TRACE, tracer => {
      new MongoReport(options).report(tracer).then(result => {
        // empty
      }).catch(err => {
        logger.err('save mongo report err', err)
      })
    })
  }

  registerJeagerReporter (options) {
    // todo 接入 Jeager 存储 tracer
  }
}
