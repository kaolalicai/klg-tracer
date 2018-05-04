import * as mongoose from 'mongoose'
import {Document, Model, Schema} from 'mongoose'
(mongoose as any).Promise = Promise
mongoose.set('debug', true)

const db = mongoose.createConnection('mongodb://127.0.0.1:40001/test')

db.on('connected', () => {
  console.log('enter connected')
  console.log(`mongodb connected successfully`)
})

db.on('error', err => {
  console.log('db err', err)
})
db.on('disconnected', () => {
  console.log('db disconnected')
})

export interface IUser {
  _id: string
  phone: string
  realName: string
  idCard: string
  email: string
}

const modelName = 'User'

export interface UserModel extends IUser, Document {
  id: string
  _id: string
}

const schema: Schema = new Schema({
  phone: {type: String},
  realName: {type: String},
  idCard: {type: String, sparse: true},
  email: {type: String}
})

schema.set('timestamps', true)        // createAt, updatedAt -> UTC
export const User: Model<UserModel> = db.model<UserModel>(modelName, schema, modelName)
export {db}
