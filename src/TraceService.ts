import * as _ from 'lodash'
import {HttpServerPatcher} from './patch/HttpServer'
import {HttpClientPatcher} from './patch/HttpClient'
import {MongodbPatcher} from './patch/Mongodb'
import {ServerHookOptions} from './domain'
import {EnvironmentUtil} from 'pandora-env'
import {DefaultEnvironment} from './mock/DefaultEnvironment'

const defaultOptions = {httpClient: {enabled: true, options: {}}, mongodb: {enabled: true, options: {}}}

export class TraceService {
  constructor () {
    this.setPandoraEnv()
  }

  setPandoraEnv () {
    EnvironmentUtil.getInstance().setCurrentEnvironment(new DefaultEnvironment())
  }

  registerHttpHooks (options: ServerHookOptions = defaultOptions) {
    _.defaults(options, defaultOptions)
    new HttpServerPatcher(options.httpServer).run()
    if (options.httpClient.enabled) new HttpClientPatcher(options.httpClient.options).run()
    if (options.mongodb.enabled) new MongodbPatcher(options.mongodb.options).run()
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
