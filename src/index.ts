type StringifyFunction = (
  obj: any,
  replacer: (k: string, v: any, _this?: any) => any
) => string

type ParseFunction = (
  repr: string,
  reviver: (k: string, v: any) => any
) => any

export class Serialize {
  private readonly registrar: {
    R: Function
    key: any
    fromJSON: (current: any, parent: any) => any
  }[] = []

  private prefix = '__'
  private stringifyFunction: StringifyFunction = JSON.stringify
  private parseFunction: ParseFunction = JSON.parse

  constructor (
    /**
     * For how to write a replacer and reviver, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    registrations: Function[],
    options: {
      prefix?: string
      stringify?: StringifyFunction,
      parse?: ParseFunction
    } = {}
  ) {
    this.prefix = typeof options.prefix === 'string' ? options.prefix : this.prefix
    this.stringifyFunction = options.stringify || this.stringifyFunction
    this.parseFunction = options.parse || this.parseFunction

    this.registrar.push(
      { R: Date, key: this.getKey(undefined, Date.prototype.constructor.name), fromJSON: (s) => new Date(s) },
      ...registrations.map((R) => {
        // @ts-ignore
        const fromJSON = R.fromJSON || ((arg: any) => isClass(R) ? new R(arg) : arg)
        const key = this.getKey((R as any).__prefix__, (R as any).__name__ || (isClass(R)
          ? R.prototype.constructor.name
          : getFunctionName(R)))

        return {
          R,
          key,
          fromJSON
        }
      })
    )

    this.registrar.reverse()
  }

  stringify (obj: any) {
    const pThis = this

    return this.stringifyFunction(obj, function (k, v, _this) {
      // @ts-ignore
      _this = this || _this
      const v0 = _this ? _this[k] : v
      if (typeof v0 === 'object') {
        for (const { R, key } of pThis.registrar) {
          if (compareNotFalsy(v0.constructor, (R.prototype || {}).constructor) ||
              compareNotFalsy(pThis.getKey(v0.__prefix__, v0.__name__), key)) {
            const parent = {} as any
            parent[key] = (
              ((R as any).toJSON || (R.prototype || {}).toJSON || v0.toJSON || v0.toString).bind(v0)
            )(_this[k], parent)
            return parent
          }
        }
      } else if (typeof v0 === 'function') {
        const parent = {} as any
        parent[pThis.getKey(undefined, 'function')] = (
          (v0.toJSON || (() => {
            return v0.toString().replace(/^.+?\{/s, '').replace(/\}.*$/s, '').trim()
          })).bind(v0)
        )(_this[k], parent)

        return parent
      }

      return v
    })
  }

  parse (repr: string) {
    return this.parseFunction(repr, (_, v) => {
      if (v && typeof v === 'object') {
        for (const { key, fromJSON } of this.registrar) {
          if (v[key]) {
            return fromJSON(v[key], v)
          }
        }

        if (v[this.getKey(undefined, 'function')]) {
          // eslint-disable-next-line no-new-func
          return new Function(v[this.getKey(undefined, 'function')])
        }
      }
      return v
    })
  }

  private getKey (prefix: any, name: any) {
    return (typeof prefix === 'string' ? prefix : this.prefix) + name
  }
}

export const RegExpProp = Item<RegExp, RegExpConstructor>(RegExp, {
  fromJSON (current: any) {
    const { source, flags } = current
    return new RegExp(source, flags)
  },
  toJSON (_this: any) {
    const { source, flags } = _this
    return { source, flags }
  }
})

export const MongoDateProp = Item(Date, {
  prefix: '',
  name: '$date',
  fromJSON: (current: string) => new Date(current)
})

export const MongoRegExpProp = Item<RegExp, RegExpConstructor>(RegExp, {
  prefix: '',
  name: '$regex',
  fromJSON (current: string, parent: { $options?: string }) {
    return new RegExp(current, parent.$options)
  },
  toJSON (_this: any, parent: any) {
    parent.$options = _this.flags
    return _this.source
  }
})

export function Item<T, Constructor extends { prototype: any } = { new (): T }> (
  K: Constructor,
  options: {
    prefix?: string
    name?: string,
    toJSON?: (_this: T, parent: any) => any,
    fromJSON?: (current: any, parent: any) => T
  }
) {
  const ItemProp = class {
    static __prefix__ = options.prefix
    static __name__ = options.name
    static fromJSON = options.fromJSON
    static toJSON = options.toJSON
  }

  ItemProp.prototype.constructor = K.prototype.constructor

  return ItemProp
}

function isClass (k: any): k is { prototype: { constructor: any } } {
  return !!(k.prototype && k.prototype.constructor)
}

function compareNotFalsy (a: any, b: any) {
  return !!a && a === b
}

function getFunctionName (R: Function) {
  return R.toString().replace(/^function /, '').split('(')[0]
}
