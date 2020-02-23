/* eslint-disable no-undef */
// Please open your JavaScript console (i.e. Inspect Element) to see the results.

/**
 * For how to use this inside web browsers, see https://unpkg.com/
 * import { Serialize, FullFunctionAdapter } from 'https://unpkg.com/any-serialize'
 *
 * Or,
 * Download and unzip https://github.com/patarapolw/any-serialize/archive/gh-pages.zip
 * And copy ./lib to your project
 *
 * For NPM users, it's `npm i any-serialize`
 */
import { Serialize, FullFunctionAdapter, UndefinedAdapter } from './lib/index.mjs'

class RegisteredClass {
  /**
   * You can turn off prefix with __prefix__ = ''
   */
  // static __prefix__ = ''
  static __key__ = 'unsafeName'

  static fromJSON (arg) {
    const { a, b } = arg
    return new RegisteredClass(a, b)
  }

  constructor (a, b) {
    this.a = a
    this.b = b
  }

  toJSON () {
    const { a, b } = this
    return { a, b }
  }
}

class UnregisteredClass {
  static funA () {
    return true
  }

  static a = 1

  b = 2

  funB () {
    return 'abc'
  }
}

const obj = {
  a: new Date(),
  r: /^hello /gi,
  f: (a, b) => a + b,
  s: new Set([1, 1, 'a']),
  registered: new RegisteredClass(2, 3),
  undefined: undefined,
  miscell: [
    undefined,
    NaN,
    Infinity,
    BigInt(900719925474099133333332),
    function fnLiteral (a) { return a }
  ]
}

describe('Deserializable', () => {
  const ser0 = new Serialize()

  /**
   * If talking about cloning, it can be done without an adapter.
   * But, for undefined, without an appropriate adapter,
   * - Thrownaway in object
   * - Kept in Array
   */
  const obj0 = ser0.clone(obj)

  // FullFunctionAdapter is required to deserialize Functions (because it can be unsafe).
  ser0.register(FullFunctionAdapter, RegisteredClass)

  const hash0 = ser0.hash(obj0)
  const stringifiedObj = ser0.stringify(obj0)
  const parsedObj = ser0.parse(stringifiedObj)
  const reStringifiedObj = ser0.stringify(parsedObj)
  const reParsedObj = ser0.parse(reStringifiedObj)
  const hash1 = ser0.hash(reParsedObj)

  it('results', () => {
    console.log('Serialize =', ser0)
    console.log(obj0, parsedObj, reParsedObj)
    console.log('stringifiedObj', stringifiedObj)
    console.log('reStringifiedObj', reStringifiedObj)
    console.log(hash0, hash1)
  })

  it('stringifyObj', () => {
    assert.equal(stringifiedObj, reStringifiedObj)
  })

  it('parsedFunction works', () => {
    assert.equal(reParsedObj.f(1, 2), 3)
  })

  it('hash is constant', () => {
    assert.equal(hash0, hash1)
  })
})

describe('Native Serialize', () => {
  const ser1 = new Serialize()
  const obj1 = ser1.clone(obj)
  ;(obj1).unregistered = new UnregisteredClass()

  /**
   * Symbol is quite special and must always be unique
   */
  it('Symbol is unique', () => {
    assert.notEqual(ser1.stringify(Symbol('hello')), ser1.stringify(Symbol('hello')))
  })

  /**
   * Deep equal is a little special in that
   * it requires hashing for objects that isn't Arrays nor plain Objects
   */
  it('use Serialize#deepEqual function', () => {
    assert(ser1.deepEqual(obj1, ser1.clone(obj1)))
  })

  /**
   * Some reality checks
   */
  it('Symbol(1) not deepEqual Symbol(1)', () => {
    assert(!ser1.deepEqual(Symbol(1), Symbol(1)))
  })

  it('NaN deepEqual NaN', () => {
    assert(ser1.deepEqual(NaN, NaN))
  })

  /**
   * To make NaN !== NaN, provide your own custom hash defintion for NaN
   */
  it('NaN can be made not deepEqual NaN', () => {
    const ser2 = new Serialize()
    ser2.register(
      {
        key: 'NaN',
        toJSON: () => Math.random()
      }
    )
    assert(!ser2.deepEqual(NaN, NaN))
  })

  it('undefined is a throwaway', () => {
    const obj2 = ser1.clone(obj1)
    ;(obj2.newKey) = undefined
    assert(ser1.deepEqual(obj1, obj2))
  })

  it('Can force compare undefined', () => {
    const ser2 = new Serialize()
    ser2.register(UndefinedAdapter)
    const obj2 = ser2.clone(obj1)
    ;(obj2.newKey) = undefined
    assert(!ser2.deepEqual(obj1, obj2))
  })
})
