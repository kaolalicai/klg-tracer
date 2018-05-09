/**
 * copy from koa.js
 * @param req
 * @returns {number}
 */

import * as qs from 'querystring'
import * as parse from 'parseurl'

export function query (req) {
  const str = querystring(req)
  const c = this._querycache = this._querycache || {}
  return c[str] || (c[str] = qs.parse(str))
}

function querystring (req) {
  if (!req) return ''
  return parse(req).query || ''
}
