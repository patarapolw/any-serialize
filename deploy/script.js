// Please open your JavaScript console (i.e. Inspect Element) to see the results.

/**
 * For how to use this inside web browsers, see https://unpkg.com/
 * import { Serialize, FullFunctionAdapter } from 'https://unpkg.com/any-serialize?module'
 *
 * Or,
 * git clone --single-branch -b gh-pages https://github.com/patarapolw/any-serialize.git
 * And copy ./lib to your project
 *
 * For NPM users, it's `npm i any-serialize`
 */
import { Serialize, FullFunctionAdapter } from './lib/index.js'

const ser = new Serialize()

// FullFunctionAdapter is required to deserialize Functions (because it can be unsafe).
ser.register(FullFunctionAdapter)
console.log('ser =', ser)

const obj = {
  a: new Date(),
  r: /^hello /gi,
  f: (a, b) => a + b
}
console.log('obj =', obj)

const stringifiedObj = ser.stringify(obj)
console.log('stringifiedObj =', stringifiedObj)

const parsedObj = ser.parse(stringifiedObj)
console.log('parsedObj =', parsedObj)

const reStringifiedObj = ser.stringify(parsedObj)
console.log('reStringifiedObj =', reStringifiedObj)

const reParsedObj = ser.parse(reStringifiedObj)
console.log('reParsedObj =', reParsedObj)

console.log(reParsedObj.f(1, 2))
