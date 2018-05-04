import {HttpServerPatcher} from 'pandora-hook'

const origin = HttpServerPatcher.prototype.buildTags
HttpServerPatcher.prototype.buildTags = function (req) {
  console.log('excute', 'buildTags')
  const tags = origin(req)
  console.log('tags', tags)
  return tags
}
export {HttpServerPatcher}
