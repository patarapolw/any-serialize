import { Serialize, FullFunctionAdapter } from '../src/index'

class CustomClass1 {
  /**
   * You can turn off prefix with __prefix__ = ''
   */
  // static __prefix__ = ''
  static __key__ = 'unsafeName'

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

class UndefClass {
  x = 10
  y = 'abc'
}

describe('Default functions', () => {
  const ser = new Serialize()
  ser.register(CustomClass1, FullFunctionAdapter)

  const r = ser.stringify({
    a: new Date(),
    r: /^hello /gi,
    f: (a: any, b: any) => a + b,
    s: new Set([1, 1, 'a']),
    c: new UndefClass(),
    c2: new CustomClass1(4, 5),
    miscell: [
      NaN,
      Infinity,
      BigInt(900719925474099133333332),
      Symbol('hello'),
      function fnLiteral (a: any) { return a }
    ]
  })

  it('stringify', () => {
    console.log(r)
    // {"a":{"__Date":"2020-02-19T07:20:23.364Z"},"r":{"__RegExp":{"source":"^hello ","flags":"gi"}},"c":{"__unsafeName":{"a":1,"b":3}},"f":{"__Function":"(a, b) => a + b"}}
  })

  it('parse', () => {
    const s = ser.parse(r)
    console.log(s)
    // { a: 2020-02-19T07:20:23.364Z,
    //   r: /^hello /gi,
    //   c: CustomClass1 { a: 1, b: 3 },
    //   f: [Function] }
    console.log(ser.stringify(s))
    // {"a":{"__Date":"2020-02-19T07:20:23.364Z"},"r":{"__RegExp":{"source":"^hello ","flags":"gi"}},"c":{"__unsafeName":{"a":1,"b":3}},"f":{"__Function":"(a, b) => a + b"}}
    console.log(s.f(1, 2))
    // 3
  })
})
