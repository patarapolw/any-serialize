# any-serialize

Serialize / Deserialize any JavaScript objects, as long as you provides how-to. I have already provided `Date`, `RegExp`, `Set` and `Function`.

[![npm version](https://badge.fury.io/js/any-serialize.svg)](https://badge.fury.io/js/any-serialize)

This package intentionally has no dependencies, and can be used safely in browser.

- Can also generate hash from anything, due to ability to serialize anything to String. (See `Serialize#hash`).
- Cloning (See `Serialize#clone`)
- Deep equality due to your definition (See `Serialize#deepEqual`)

## Usage

See [/tests](/tests).

`Date`, `RegExp` and `Function` is already serialable via this library by default.

- Functions are only provided in "write-only mode".
  - To enable "reconstruction", use `FullFunctionAdapter`. (Which is in principle similar to unsafe eval.)
- Classes are not. You need to provide at least `static fromJSON()` and `toJSON()`
- You can provide a custom way to serialize, including the forementioned `Date`, `RegExp` and `Function`.

```js
import { Serialize, FullFunctionAdapter } from 'any-serialize'

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

cconst ser = new Serialize()
ser.register(CustomClass1, FullFunctionAdapter)

const r = ser.stringify({
  a: new Date(),
  r: /^hello /gi,
  c: new CustomClass1(1, 3),
  f: (a: number, b: number) => a + b
})

console.log(r)
// {"a":{"__Date":"2020-02-18T17:53:37.557Z"},"r":{"__RegExp":{"source":"^hello ","flags":"gi"}},"c":{"__unsafeName":{"a":1,"b":3}},"f":{"__Function":"(a, b) => a + b"}}

const s = ser.parse(r)
console.log(s)
// { a: 2020-02-18T17:52:02.555Z,
//   r: /^hello /gi,
//   c: CustomClass1 { a: 1, b: 3 },
//   f: [Function: anonymous] }
console.log(ser.stringify(s))
// {"a":{"__Date":"2020-02-18T17:53:37.557Z"},"r":{"__RegExp":{"source":"^hello ","flags":"gi"}},"c":{"__unsafeName":{"a":1,"b":3}},"f":{"__Function":"(a, b) => a + b"}}
```
