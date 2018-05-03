import {Patcher} from './Patcher'
import {hook} from 'module-hook'
import {MongodbShimmer} from './shimmers/mongodb/Shimmer'

export class MongodbPatcher extends Patcher {

  constructor (options = {}) {
    super(options)

    this.shimmer(options)
  }

  getModuleName () {
    return 'mongodb'
  }

  shimmer (options) {
    const traceManager = this.getTraceManager()
    const shimmer = this.getShimmer()
    hook('mongodb', '>=2.2.x', (loadModule) => {
      const mongodb = loadModule('./index')

      if (mongodb.instrument) {
        const mongodbShimmer = new MongodbShimmer(shimmer, traceManager, options)
        mongodb.instrument({}, mongodbShimmer.instrumentModules)
      }
      // 暂时不考虑没有 apm 的低版本
      return
    })
    this.shimmerForJest(options)
  }

  shimmerForJest (options) {
    const traceManager = this.getTraceManager()
    const shimmer = this.getShimmer()
    import('mongodb').then((mongodb) => {
      let mongo = mongodb as any
      if (mongo.instrument) {
        const mongodbShimmer = new MongodbShimmer(shimmer, traceManager, options)
        mongo.instrument({}, mongodbShimmer.instrumentModules)
      }
    })
  }
}
