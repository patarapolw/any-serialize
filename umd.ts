import {
  Serialize,
  FullFunctionAdapter,
  MongoDateAdapter,
  MongoRegExpAdapter
} from './src'

Object.assign(window, { Serialize })
Object.assign(Serialize, {
  FullFunctionAdapter,
  MongoDateAdapter,
  MongoRegExpAdapter
})
