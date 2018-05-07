import {BaseEnvironment} from 'pandora-env'
import {MetricsConstants} from 'pandora-metrics'

export class DefaultEnvironment extends BaseEnvironment {

  constructor () {
    super({
      appName: MetricsConstants.METRICS_DEFAULT_APP
    })
  }

  match (name) {
    return name === 'default'
  }

}
