import * as _ from 'lodash'
import {KlgHttpServerPatcher} from './patch/HttpServer'
import {KlgHttpClientPatcher} from './patch/HttpClient'
import {MongodbPatcher} from './patch/Mongodb'
import {ServerHookOptions} from './domain'
import {EnvironmentUtil} from 'pandora-env'
import {DefaultEnvironment} from './mock/DefaultEnvironment'
import {logger} from './util/Logger'
import {MongoReport, MongoReportOption} from './report/MongoReport'

const defaultOptions = {
  httpServer: {
    recordGetParams: true,
    recordPostData: true,
    recordResponse: true
  },
  httpClient: {
    enabled: true,
    options: {
      recordGetParams: true,
      recordPostData: true,
      recordResponse: true
    }
  },
  mongodb: {
    enabled: true, options: {}
  }
}

export class TraceService {
  constructor () {
    this.setPandoraEnv()
  }

  setPandoraEnv () {
    EnvironmentUtil.getInstance().setCurrentEnvironment(new DefaultEnvironment())
  }

  registerHooks (options: ServerHookOptions = defaultOptions) {
    _.defaults(options, defaultOptions)
    new KlgHttpServerPatcher(options.httpServer).run()
    if (options.httpClient.enabled) new KlgHttpClientPatcher(options.httpClient.options).run()
    if (options.mongodb.enabled) new MongodbPatcher(options.mongodb.options).run()
  }

  registerMongoReporter (options: MongoReportOption) {
    const mongo = new MongoReport(options)
    process.on('PANDORA_PROCESS_MESSAGE_TRACE' as any, (tracer: any) => {
      mongo.report(tracer).then(result => {
        // empty
      }).catch(err => {
        logger.err('save mongo report err', err)
      })
    })
  }
}
