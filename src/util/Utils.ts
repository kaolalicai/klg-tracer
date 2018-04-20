import * as url from 'url'
import * as semver from 'semver'

const LOCALHOST_NAMES = {
  'localhost': true,
  '127.0.0.1': true,
  '0.0.0.0': true,
  '0:0:0:0:0:0:0:1': true,
  '::1': true,
  '0:0:0:0:0:0:0:0': true,
  '::': true
}

/**
 * 提取 path 信息，去掉尾部反斜杠
 * @param requestUrl
 * @returns {string}
 */
export function extractPath (requestUrl) {
  if (typeof requestUrl === 'string') {
    requestUrl = url.parse(requestUrl)
  }

  let path = requestUrl.pathname

  if (path) {
    if (path !== '/' && path.charAt(path.length - 1) === '/') {
      path = path.substring(0, path.length - 1)
    }
  } else {
    path = '/'
  }

  return path
}

export function safeParse (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return str
  }
}

export function isLocalhost (host) {
  return !!LOCALHOST_NAMES[host]
}

export function nodeVersion (rule) {
  return semver.satisfies(process.version as any, rule)
}

export function hasOwn (obj, key) {
  return Object.hasOwnProperty.call(obj, key)
}

export function isAsyncFunction (funktion) {
  return funktion && {}.toString.call(funktion) === '[object AsyncFunction]'
}

export function isGeneratorFunction (funktion) {
  const constructor = funktion.constructor

  if (!constructor) {
    return false
  }

  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) {
    return true
  }

  return 'function' === typeof constructor.prototype.next && 'function' === typeof constructor.prototype.throw
}

export function isFunction (funktion) {
  return funktion && ({}.toString.call(funktion) === '[object Function]' || isGeneratorFunction(funktion) || isAsyncFunction(funktion))
}
