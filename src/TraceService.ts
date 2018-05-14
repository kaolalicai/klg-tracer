import * as _ from 'lodash'
import {KlgHttpServerPatcher} from './patch/HttpServer'
import {KoaServerPatcher} from './patch/KoaServer'
import {KlgHttpClientPatcher} from './patch/HttpClient'
import {MongodbPatcher} from './patch/Mongodb'
import {TracerOptions} from './domain'
import {EnvironmentUtil} from 'pandora-env'
import {DefaultEnvironment} from './mock/DefaultEnvironment'
import {logger} from './util/Logger'
import {MongoReport, MongoReportOption} from './report/MongoReport'

const debug = require('debug')('Klg:Tracer:TraceService')

const defaultOptions = {
  httpServer: {
    useKoa: false,
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
    enabled: true,
    options: {
      useMongoose: true
    }
  }
}

export class TraceService {
  constructor () {
    this.setPandoraEnv()
  }

  setPandoraEnv () {
    EnvironmentUtil.getInstance().setCurrentEnvironment(new DefaultEnvironment())
  }

  registerHooks (options: TracerOptions = defaultOptions) {
    _.defaultsDeep(options, defaultOptions)
    debug('options:', options)
    if (options.httpServer.useKoa) {
      new KoaServerPatcher(options.httpServer).run()
    } else {
      new KlgHttpServerPatcher(options.httpServer).run()
    }
    if (options.httpClient.enabled) new KlgHttpClientPatcher(options.httpClient.options).run()
    if (options.mongodb.enabled) new MongodbPatcher(options.mongodb.options).run()
    return this
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
