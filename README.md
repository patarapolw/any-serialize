# any-serialize

Serialize any JavaScript classes, as long as you provides how-to.

This package intentionally has no dependencies, but you might want to customize with some packages, such as

- [json-stable-stringify](https://github.com/substack/json-stable-stringify)
- [uuid](https://github.com/uuidjs/uuid) or [nanoid](https://github.com/ai/nanoid)

## Usage

See [/tests](/tests).

```js
import { Serialize } from 'any-serialize'

RegExp.prototype.toJSON = function () {
  const { source, flags } = this
  return { source, flags }
}

RegExp.fromJSON = ({ source, flags }) => {
  return new RegExp(source, flags)
}

const ser = new Serialize([Date, RegExp])

const r = ser.stringify({
  a: new Date(),
  r: /^hello$/
})

console.log(r)
console.log(ser.parse(r))
```

Also, you might want to cache `r.id`, which is a unique key to prevent collision with other JavaScript objects (arrays, actually).

To ensure collision prevention, you might use a better than `Math.random()`, for example `nanoid` or `uuid`.

Indeed, if you don't to modify native objects, you might extend the class.

```ts
class RegExpSerialiable extends RegExp {
  static fromJSON ({ source, flags }) {
    return new RegExp(source, flags)
  }

  toJSON () {
    const { source, flags } = this
    return { source, flags }
  }
}

// Use the cached ID from the previous step.
const ser = new Serialize([Date, RegExpSerialiable], { id })
```

If you to create a hash or ensure key order, you might use [json-stable-stringify](https://github.com/substack/json-stable-stringify)

```ts
const ser = new Serialize([Date, RegExpSerialiable], {
  stringify(obj, replacer) {
    return stringify(obj, { replacer })
  }
})
```
