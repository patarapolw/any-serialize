import { Serialize, RegExpProp } from '../src'

class CustomClass1 {
  /**
   * You can turn off prefix with __prefix__ = ''
   */
  // static __prefix__ = ''
  static __name__ = 'unsafeName'

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
  const ser = new Serialize([RegExpProp, CustomClass1])
  const r = ser.stringify({
    a: new Date(),
    r: /^hello /gi,
    c: new CustomClass1(1, 3),
    f: (a: number, b: number) => a + b
  })

  it('stringify', () => {
    console.log(r)
    // {"a":{"$Date":"2020-02-18T14:39:51.062Z"},"r":{"$RegExp":{"source":"^hello ","flags":"gi"}},
    // "c":{"$custom_name":{"a":1,"b":3}}}
  })

  it('parse', () => {
    const s = ser.parse(r)
    console.log(s)
    // { a: 2020-02-18T14:39:51.062Z,
    //   r: /^hello /gi,
    //   c: CustomClass1 { a: 1, b: 3 } }
    console.log(ser.stringify(s))
  })
})
