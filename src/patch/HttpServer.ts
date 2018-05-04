import {HttpServerPatcher} from 'pandora-hook'

const origin = HttpServerPatcher.prototype.buildTags
HttpServerPatcher.prototype.buildTags = function (req) {
  const tags = origin(req)
  return tags
}
export {HttpServerPatcher}
