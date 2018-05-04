import {HttpServerPatcher} from 'pandora-hook'
import {query} from '../util/QueryParser'

const origin = HttpServerPatcher.prototype.buildTags
HttpServerPatcher.prototype.buildTags = function (req) {
  console.log('excute', 'buildTags')
  const tags = origin(req)
  console.log('tags', tags)
  return tags
}
export {HttpServerPatcher}
