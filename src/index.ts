export class Serialize {
  public registrar: Record<string, any>

  constructor (
    /**
     * For how to write a replacer and reviver, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    registrations: any[],
    private options: {
      id: string,
      stringify: (
        obj: any,
        replacer: (k: string, v: any, _this?: any) => any
      ) => string,
      parse: (
        repr: string,
        reviver: (k: string, v: any) => any
      ) => any
    } = {
      id: `$$${Math.random().toString(36).substr(2)}`,
      stringify: JSON.stringify,
      parse: JSON.parse
    }
  ) {
    this.registrar = registrations.reduce((prev, K) => {
      K.__fromRepr__ = K.__fromRepr__ || K.fromJSON || ((arg: string) => new K(arg))

      return {
        ...prev,
        [K.__name__ || (() => {
          return K.toString().replace(/^function /, '').split('()')[0]
        })()]: K
      }
    }, {})
  }

  stringify (obj: any) {
    const id = this.options.id
    const regis = this.registrar

    return this.options.stringify(obj, function (k, v, _this) {
      // @ts-ignore
      _this = this || _this
      const v0 = _this ? _this[k] : v
      if (typeof v0 === 'object') {
        v0.__repr__ = v0.toJSON || v0.__repr__ || v0.toString
        for (const [name, r] of Object.entries(regis)) {
          if (v0 instanceof r) {
            return [id, name, v0.__repr__()]
          }
        }
      }

      return v
    })
  }

  parse (repr: string) {
    return this.options.parse(repr, (_, v) => {
      if (Array.isArray(v) && v.length === 3 && v[0] === this.options.id) {
        console.log(v[2])
        return this.registrar[v[1]].__fromRepr__(v[2])
      }
      return v
    })
  }
}
