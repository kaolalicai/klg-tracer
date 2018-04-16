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
      result.push({
        traceId: data.traceId,
        userI: data.traceId,
        name: span.name,
        timestamp: span.timestamp,
        duration: span.duration,
        tags: {
          httpMethod: span.tags['http.method'],
          hostname: span.tags['http.hostname'],
          port: span.tags['http.port'],
          response_size: span.tags['http.response_size'],
          status_code: span.tags['http.status_code'],
          url: span.tags['http.url'],
          query: span.tags['http.query'],
          body: span.tags['http.body'],
          response: span.tags['http.response']
        }
      })
    }
    return result
  }
}
