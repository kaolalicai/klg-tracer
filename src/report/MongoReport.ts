import {IReport, SpanData} from '../domain'
import * as mongoose from 'mongoose'
import * as assert from 'assert'
import {LogCRUD} from 'klg-log-model'

export interface MongoReportOption {
  mongoUrl: string,
  collectionName?: string
}

export class MongoReport implements IReport {
  options: MongoReportOption
  crud: LogCRUD

  constructor (options: MongoReportOption) {
    assert(options.mongoUrl, 'mongoUrl must given')
    this.options = options
    this.initDb()
  }

  async report (data: SpanData) {
    const logs = this.transData(data)
    this.crud.save(logs)
  }

  initDb () {
    const db = mongoose.createConnection(this.options.mongoUrl)
    this.crud = new LogCRUD(db, this.options.collectionName)
  }

  transData (data: SpanData) {
    return data
  }
}
