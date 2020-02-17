import { Serialize, Item } from '../src'

const ser = new Serialize([Date, Item(RegExp, {
  toJSON () {
    const { source, flags } = this as RegExp
    return { source, flags }
  },
  fromJSON ({ source, flags }) {
    return new RegExp(source, flags)
  }
})])

const r = ser.stringify({
  a: new Date(),
  r: /^hello$/
})

console.log(r)

console.log(ser.parse(r))
