import {HttpServerPatcher} from './hook/HttpServer'
import {KoaServerPatcher} from './hook/KoaServer'
import {HttpClientPatcher} from './hook/HttpClient'
import {MongoReportOption, MongoReport} from './report/MongoReport'
import {MessageConstants, MessageSender} from './util/MessageSender'
import {logger} from './util/Logger'

export interface HookOptions {
  httpClient: boolean,
  slowThreshold: boolean
}

const defaultOptions = {httpClient: true, slowThreshold: true}

export class TraceService {
  registerHttpHooks (options: HookOptions = defaultOptions) {
    new HttpServerPatcher().shimmer()
    if (options.httpClient) new HttpClientPatcher().shimmer()
  }

  registerKoaHooks (app, options: HookOptions = defaultOptions) {
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
