import * as _ from 'lodash'
import {KlgHttpServerPatcher} from './patch/HttpServer'
import {KlgHttpClientPatcher} from './patch/HttpClient'
import {MongodbPatcher} from './patch/Mongodb'
import {ServerHookOptions} from './domain'
import {EnvironmentUtil} from 'pandora-env'
import {DefaultEnvironment} from './mock/DefaultEnvironment'

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
}
