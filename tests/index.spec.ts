import { Serialize, RegExpProp } from '../src'

class CustomClass1 {
  static __name__ = 'custom_name'

  static fromJSON (arg: {a: number, b: number}) {
    const { a, b } = arg
    return new CustomClass1(a, b)
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

describe('Default functions', () => {
  it('default', () => {
    const ser = new Serialize([Date, RegExpProp, CustomClass1])

    const r = ser.stringify({
      a: new Date(),
      r: /^hello /gi,
      c: new CustomClass1(1, 3)
    })

    console.log(r)
    // {"a":{"$Date":"2020-02-17T13:37:42.279Z"},"r":{"$RegExp":{"source":"^hello$","flags":""}},"c":{"$custom_name":{"a":1,"b":3}}}
    console.log(ser.parse(r))
    // { a: 2020-02-17T13:37:42.279Z,
    //   r: /^hello$/,
    //   c: CustomClass { a: 1, b: 3 } }
  })
})
