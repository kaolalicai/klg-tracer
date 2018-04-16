import {IReport} from '../domain'
import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import * as assert from 'assert'
import {LogCRUD} from 'klg-log-model'
import {TraceData} from '../domain'

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

  async report (data: TraceData) {
    const logs = this.transData(data)
    this.crud.save(logs)
  }

  initDb () {
    const db = mongoose.createConnection(this.options.mongoUrl)
    this.crud = new LogCRUD(db, this.options.collectionName)
  }

  transData (data: TraceData): Array<any> {
    let result = []
    for (let span of data.spans) {
      const newSpan = Object.assign({
        status: data.status
      }, _.cloneDeep(span))
      result.push(newSpan)
    }
    return result
  }
}
