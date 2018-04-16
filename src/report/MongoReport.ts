import {IReport} from '../domain'
import * as mongoose from 'mongoose'
import * as assert from 'assert'
import {TracerCRUD} from 'klg-tracer-model'
import {TraceData} from '../domain'

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
    await this.crud.patchSave(tracers)
  }

  initDb () {
    const db = mongoose.createConnection(this.options.mongoUrl)
    this.crud = new TracerCRUD(db, this.options.collectionName)
  }

  transData (data: TraceData): Array<any> {
    let result = []
    for (let span of data.spans) {
      const obj = cleanTags(span.tags)
      result.push({
        traceId: data.traceId,
        userI: data.traceId,
        name: span.name,
        timestamp: span.timestamp,
        duration: span.duration,
        tags: {
          httpMethod: obj['http.method'],
          hostname: obj['http.hostname'],
          port: obj['http.port'],
          response_size: obj['http.response_size'],
          status_code: obj['http.status_code'],
          url: obj['http.url'],
          query: obj['http.query'],
          body: obj['http.body'],
          response: obj['http.response']
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

    return result
  }
}
