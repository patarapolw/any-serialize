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
import { Serialize, Item } from '../src'

const ser = new Serialize([Date, Item(RegExp, {
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
  r: /^hello$/
})

console.log(r)
// {"a":{"$Date":"2020-02-17T13:23:10.726Z"},"r":{"$RegExp":{"source":"^hello$","flags":""}}}
console.log(ser.parse(r))
// { a: 2020-02-17T13:23:10.726Z, r: /^hello$/ }
```

To ensure collision prevention, you might set `$id` with `nanoid` or `uuid`.

And, on perhaps, client-side, you deserialize with the same `$id`.

```ts
// Use the cached ID from the previous step.
const ser = new Serialize([Date, Item(...)], { $id })
```

If you to create a hash or ensure key order, you might use [json-stable-stringify](https://github.com/substack/json-stable-stringify)

```ts
const ser = new Serialize([Date, RegExpSerialiable], {
  stringify(obj, replacer) {
    return stringify(obj, { replacer })
  }
})
```
