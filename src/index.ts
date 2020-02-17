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
    this.registrar = registrations.reduce((prev, K) => {
      K.fromJSON = K.fromJSON || ((arg: string) => new K(arg))

      return {
        ...prev,
        [K.__name__ || (() => {
          return K.toString().replace(/^function /, '').split('()')[0]
        })()]: K
      }
    }, {})
  }

  get $id () {
    return this.options.$id
  }

  set $id (id: string | undefined) {
    this.options.$id = id
  }

  stringify (obj: any) {
    const $id = this.options.$id
    const regis = this.registrar

    return this.options.stringify(obj, function (k, v, _this) {
      // @ts-ignore
      _this = this || _this
      const v0 = _this ? _this[k] : v
      if (typeof v0 === 'object') {
        v0.toJSON = v0.toJSON || v0.toString
        for (const [name, r] of Object.entries(regis)) {
          if (v0 instanceof r) {
            return {
              $id,
              [`$${name}`]: v0.toJSON()
            }
          }
        }
      }

      return v
    })
  }

  parse (repr: string) {
    return this.options.parse(repr, (_, v) => {
      if (v && typeof v === 'object' && v.$id === this.options.$id) {
        for (const [k0, v0] of Object.entries(this.registrar)) {
          if (v[`$${k0}`]) {
            return v0.fromJSON(v[`$${k0}`])
          }
        }
      }
      return v
    })
  }
}

export const Item = (
  K: any,
  options: {
    name?: string,
    toJSON?: (_this: any) => any,
    fromJSON?: (_this: any) => any
  }
) => {
  const { name, toJSON, fromJSON } = options

  if (name) {
    Object.assign(K, { __name__: name })
  }

  if (fromJSON) {
    Object.assign(K, { fromJSON })
  }

  if (toJSON) {
    toJSON.bind(K)
    Object.assign(K.prototype, { toJSON })
  }

  return K
}
