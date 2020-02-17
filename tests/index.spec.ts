import { Serialize, Item } from '../src'

class CustomClass {
  static __name__ = 'custom_name'

  static fromJSON (arg: {a: number, b: number}) {
    const { a, b } = arg
    return new CustomClass(a, b)
  }

  a: number
  b: number

  constructor (a: number, b: number) {
    this.a = a
    this.b = b
  }

  toJSON () {
    const { a, b } = this
    return { a, b }
  }
}

const ser = new Serialize([Date, CustomClass, Item(RegExp, {
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
  r: /^hello$/,
  c: new CustomClass(1, 3)
})

console.log(r)
// {"a":{"$Date":"2020-02-17T13:37:42.279Z"},"r":{"$RegExp":{"source":"^hello$","flags":""}},"c":{"$custom_name":{"a":1,"b":3}}}
console.log(ser.parse(r))
// { a: 2020-02-17T13:37:42.279Z,
//   r: /^hello$/,
//   c: CustomClass { a: 1, b: 3 } }
