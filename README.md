# any-serialize

Serialize any JavaScript classes, as long as you provides how-to.

[![npm version](https://badge.fury.io/js/any-serialize.svg)](https://badge.fury.io/js/any-serialize)

This package intentionally has no dependencies, but you might want to customize with some packages, such as

- [json-stable-stringify](https://github.com/substack/json-stable-stringify)
- [uuid](https://github.com/uuidjs/uuid) or [nanoid](https://github.com/ai/nanoid)

## Usage

See [/tests](/tests).

Note that `Date` is already serialable via this method by default; however, `RegExp`, `Function` and `Class` might not be.

```js
import { Serialize, Item } from 'any-serialize'

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
```

To ensure collision prevention, you might set `$id` with `nanoid` or `uuid`.

And, on perhaps, client-side, you deserialize with the same `$id`.

```ts
const ser = new Serialize([Date, Item(...)], { $id })
```

If you to create a hash or ensure key order, you might use [json-stable-stringify](https://github.com/substack/json-stable-stringify)

```ts
const ser = new Serialize([Date, Item(...)], {
  stringify(obj, replacer) {
    return stringify(obj, { replacer })
  }
})
```
