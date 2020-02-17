import { Serialize } from '../src'

class RegExpSerialiable extends RegExp {
  static fromJSON ({ source, flags }) {
    return new RegExp(source, flags)
  }

  toJSON () {
    const { source, flags } = this
    return { source, flags }
  }
}

const ser = new Serialize([Date, RegExpSerialiable])

const r = ser.stringify({
  a: new Date(),
  r: /^hello$/
})

console.log(r)

console.log(ser.parse(r))
