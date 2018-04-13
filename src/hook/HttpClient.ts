const http = require('http')
const https = require('https')
import {Patcher} from './Patcher'
import * as semver from 'semver'
import {HttpClientShimmer} from './shimmers/http-client/Shimmer'

export class HttpClientPatcher extends Patcher {

  constructor (options = {}) {
    super(Object.assign({
      shimmerClass: HttpClientShimmer,
      remoteTracing: true
    }, options))
  }

  getModuleName () {
    return 'httpClient'
  }

  getModule () {
    return {
      http,
      https
    }
  }

  shimmer () {
    const traceManager = this.getTraceManager()
    const shimmer = this.getShimmer()
    const options = this.options
    const ShimmerClass = options.shimmerClass
    const httpClientShimmer = new ShimmerClass(shimmer, traceManager, options)
    const modules = this.getModule()

    const WRAP_HTTPS = semver.satisfies(process.version as any, '<0.11 || >=9.0.0 || 8.9.0')

    httpClientShimmer.wrapHttpRequest(modules.http)

    // 通常情况下，https 的 request 方法调用的是 http 的 request
    // 但有部分版本使用了基础实现，需要单独处理
    if (WRAP_HTTPS || options.forceHttps) {
      httpClientShimmer.wrapHttpRequest(modules.https)
    }
  }
}
