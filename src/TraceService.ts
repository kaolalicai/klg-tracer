import {HttpServerPatcher} from './hook/HttpServer'
import {HttpClientPatcher} from './hook/HttpClient'
import {MongoReportOption, MongoReport} from './report/MongoReport'
import {MessageConstants, MessageSender} from './util/MessageSender'
import {logger} from './util/Logger'

export class TraceService {
  registerHooks (options: { httpClient: boolean } = {httpClient: true}) {
    new HttpServerPatcher().shimmer()
    if (options.httpClient) new HttpClientPatcher().shimmer()
  }

  registerMongoReporter (options: MongoReportOption) {
    new MessageSender().on(MessageConstants.TRACE, data => {
      new MongoReport(options).report(data).then(result => {
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
