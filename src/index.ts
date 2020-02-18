export class Serialize {
  public registrar: Record<string, any>

  constructor (
    /**
     * For how to write a replacer and reviver, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    registrations: any[],
    private options: {
      $id?: string,
      stringify: (
        obj: any,
        replacer: (k: string, v: any, _this?: any) => any
      ) => string,
      parse: (
        repr: string,
        reviver: (k: string, v: any) => any
      ) => any
    } = {
      stringify: JSON.stringify,
      parse: JSON.parse
    }
  ) {
    this.registrar = registrations.reduce((prev, K: any) => {
      // @ts-ignore
      K.fromJSON = K.fromJSON || ((arg: string) => isClass(K) ? new K(arg) : undefined)
      const key = K.__name__ || (isClass(K)
        ? K.prototype.constructor.name
        : K.__id__)

      return {
        ...prev,
        [key]: K
      }
    }, {})
  }

  get $id () {
    return this.options.$id
  }

  stringify (obj: any) {
    const $id = this.options.$id
    const regis = this.registrar

    return this.options.stringify(obj, function (k, v, _this) {
      // @ts-ignore
      _this = this || _this
      const v0 = _this ? _this[k] : v
      if (typeof v0 === 'object') {
        for (const [key, R] of Object.entries(regis)) {
          if (compareNotFalsy(v0.constructor, (R.prototype || {}).constructor) ||
              compareNotFalsy(v0.__name__, R.__name__)) {
            const parent = { $id } as any
            const toJSON = (R.toJSON || (R.prototype || {}).toJSON || v0.toJSON || v0.toString).bind(v0)
            parent[`$${key}`] = toJSON(_this[k], parent)
            return parent
          }
        }
      }

      return v
    })
  }

  parse (repr: string) {
    return this.options.parse(repr, (_, v) => {
      if (v && typeof v === 'object' && v.$id === this.options.$id) {
        for (const [key, R] of Object.entries(this.registrar)) {
          if (v[`$${key}`]) {
            return R.fromJSON(v[`$${key}`], v)
          }
        }
      }
      return v
    })
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
  name: 'date'
})

export const MongoRegExpProp = Item<RegExp, RegExpConstructor>(RegExp, {
  name: 'regex',
  fromJSON (_this: string, parent: { $options?: string }) {
    return new RegExp(_this, parent.$options)
  },
  toJSON (_this: any, parent: any) {
    parent.$options = _this.flags
    return _this.source
  }
})

export function Item<T, Constructor extends { prototype: any } = { new (): T }> (
  K: Constructor,
  options: {
    name?: string,
    toJSON?: (_this: T, parent: any) => any,
    fromJSON?: (current: any, parent: any) => any
  }
) {
  const ItemProp = class {
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
