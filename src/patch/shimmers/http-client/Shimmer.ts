import {HttpClientShimmer} from 'pandora-hook'

export class KlgHttpClientShimmer extends HttpClientShimmer {
  buildTags (args, request) {
    const tags = super.buildTags(args, request)
    return tags
  }
}
