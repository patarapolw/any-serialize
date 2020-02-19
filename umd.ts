import {
  Serialize,
  FullFunctionAdapter,
  MongoDateAdapter,
  MongoRegExpAdapter
} from '.'

Object.assign(window, { Serialize })
Object.assign(Serialize, {
  FullFunctionAdapter,
  MongoDateAdapter,
  MongoRegExpAdapter
})
