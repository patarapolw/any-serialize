import { IRegistration } from './utils'

export const MongoDateAdapter: IRegistration = {
  prefix: '',
  key: '$date',
  item: Date,
  fromJSON: (current) => new Date(current)
}

export const MongoRegExpAdapter: IRegistration = {
  prefix: '',
  key: '$regex',
  item: RegExp,
  fromJSON (current: string, parent: { $options?: string }) {
    return new RegExp(current, parent.$options)
  },
  toJSON (_this: any, parent: any) {
    parent.$options = _this.flags
    return _this.source
  }
}
