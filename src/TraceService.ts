import * as _ from 'lodash'
import {HttpServerPatcher} from './patch/HttpServer'
import {KoaServerPatcher} from './patch/KoaServer'
import {HttpClientPatcher} from './patch/HttpClient'
// import {MongoReportOption, MongoReport} from './report/MongoReport'
import {logger} from './util/Logger'
import {ServerHookOptions} from './domain'

const defaultOptions = {httpClient: {enabled: true, options: {}}, mongodb: {enabled: true, options: {}}}

export class TraceService {

  registerHttpHooks (options: ServerHookOptions = defaultOptions) {
    _.defaults(options, defaultOptions)
    new HttpServerPatcher(options.httpServer).run()
    if (options.httpClient.enabled) new HttpClientPatcher(options.httpClient.options).run()
  }

  // registerKoaHooks (app, options: HookOptions = defaultOptions) {
  //   _.defaults(options, defaultOptions)
  //   new KoaServerPatcher(app, options).shimmer()
  //   if (options.httpClient) new HttpClientPatcher().shimmer()
  // }
  //
  // registerMongoReporter (options: MongoReportOption) {
  //   new MessageSender().on(MessageConstants.TRACE, tracer => {
  //     new MongoReport(options).report(tracer).then(result => {
  //       // empty
  //     }).catch(err => {
  //       logger.err('save mongo report err', err)
  //     })
  //   })
  // }

  registerJeagerReporter (options) {
    // todo 接入 Jeager 存储 tracer
  }
}
