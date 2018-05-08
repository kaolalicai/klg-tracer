import {HttpServerPatcher} from 'pandora-hook'

export class KlgHttpServerPatcher extends HttpServerPatcher {
  constructor (options?) {
    super(options)
  }

  buildTags (req) {
    const tags = super.buildTags(req)
    return tags
  }
}
