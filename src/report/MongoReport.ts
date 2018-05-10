import {IReport} from '../domain'
import * as mongoose from 'mongoose'
import * as assert from 'assert'
import {TracerCRUD} from 'klg-tracer-model'
import {TraceData, SpanData} from '../domain'

const debug = require('debug')('Klg:Tracer:Report:MongoReport')

export interface MongoReportOption {
  mongoUrl: string,
  collectionName?: string
}

export class MongoReport implements IReport {
  options: MongoReportOption
  crud: TracerCRUD

  constructor (options: MongoReportOption) {
    assert(options.mongoUrl, 'mongoUrl must given')
    this.options = options
    this.initDb()
  }

  async report (data: TraceData) {
    const tracers = this.transData(data)
    debug('tracer trans result ', JSON.stringify(tracers))
    await this.crud.patchSave(tracers)
  }

  initDb () {
    const db = mongoose.createConnection(this.options.mongoUrl)
    this.crud = new TracerCRUD(db, this.options.collectionName)
  }

  transData (data: TraceData): Array<any> {
    let result = []
    debug('tracer result ', JSON.stringify(data))
    for (let span of data.spans) {
      const tag = cleanTags(span.tags)
      const log = cleanLogs(span.logs)
      result.push({
        traceId: data.traceId,
        userId: data.userId,
        name: span.name,
        timestamp: span.timestamp,
        duration: span.duration,
        tags: {
          httpMethod: tag['http.method'],
          hostname: tag['http.hostname'],
          port: tag['http.port'],
          response_size: tag['http.response_size'],
          status_code: tag['http.status_code'],
          url: tag['http.url'] || tag['http.path'],
          query: log['query'],
          body: log['data'],
          response: log['response']
        }
      })
    }

    function cleanTags (tags) {
      const obj = {}
      for (let key of Object.keys(tags)) {
        obj[key] = tags[key].value
      }
      return obj
    }

    function cleanLogs (logs) {
      const obj = {}
      for (let log of logs) {
        for (let field of log.fields) {
          obj[field.key] = field.value
        }
      }
      return obj
    }

    return result
  }
}
