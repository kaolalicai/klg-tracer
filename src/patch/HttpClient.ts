import {HttpClientPatcher} from 'pandora-hook'
import {KlgHttpClientShimmer} from './shimmers/http-client/Shimmer'

export class KlgHttpClientPatcher extends HttpClientPatcher {
  constructor (options?) {
    super(Object.assign({
      shimmerClass: KlgHttpClientShimmer
    }, options))
  }
}
