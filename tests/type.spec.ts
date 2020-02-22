import assert from 'assert'

import { Serialize, UndefinedAdapter, FullFunctionAdapter } from '../src/index'
import { getTypeofDetailed, TypeExtra, TypeNativeNonSerializable } from '../src/type'

class NamedClassWithoutMethods {}

class NamedClassWithMethods {
  foo (c: string) {
    return c + 'bar'
  }
}

class NamedArray extends Array {
  foo2 (d: number) {
    return d + 1
  }
}

const ser = new Serialize()
ser.register(UndefinedAdapter, FullFunctionAdapter)

describe('Special Types', () => {
  const specialTypes: Record<TypeExtra | TypeNativeNonSerializable, any[]> = {
    Null: [null],
    NaN: [NaN],
    Named: [new NamedClassWithMethods(), new NamedClassWithoutMethods()],
    Infinity: [Infinity, -Infinity],
    Array: [new Array(5)],
    NamedArray: [new NamedArray(5)],
    Constructor: [NamedClassWithMethods, NamedClassWithoutMethods, Array, NamedArray],
    bigint: [BigInt(900719925474099133333332)],
    symbol: [Symbol('hello')],
    undefined: [undefined],
    object: [{ a: 1 }],
    function: [function fnLiteral (a: any) { return a }, (b: any) => b]
  }

  Object.entries(specialTypes).map(([typeName, entries]) => {
    describe(typeName, () => {
      entries.map((el) => {
        const is = getTypeofDetailed(el).is

        it(is.join(', '), () => {
          const s0 = ser.stringify(el)
          console.log(s0)
          const r1 = ser.parse(s0)
          if (is[0] !== 'NamedArray') {
            assert.equal(s0, ser.stringify(r1))
          }
        })
      })
    })
  })
})
