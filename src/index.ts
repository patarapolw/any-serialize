import {
  StringifyFunction, ParseFunction, IRegistration,
  isClass, getFunctionName, compareNotFalsy, functionToString
} from './utils'

export class Serialize {
  private registrar: {
    R: Function
    key: any
    toJSON?: (_this: any, parent: any) => any
    fromJSON?: (current: any, parent: any) => any
  }[] = []

  private prefix = '__'
  private stringifyFunction: StringifyFunction = JSON.stringify
  private parseFunction: ParseFunction = JSON.parse

  constructor (
    /**
     * For how to write a replacer and reviver, see
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
     */
    options: {
      prefix?: string
      stringify?: StringifyFunction,
      parse?: ParseFunction
    } = {}
  ) {
    this.prefix = typeof options.prefix === 'string' ? options.prefix : this.prefix
    this.stringifyFunction = options.stringify || this.stringifyFunction
    this.parseFunction = options.parse || this.parseFunction

    this.register(
      { item: Date },
      {
        item: RegExp,
        toJSON (_this: any) {
          const { source, flags } = _this
          return { source, flags }
        },
        fromJSON (current: any) {
          const { source, flags } = current
          return new RegExp(source, flags)
        }
      },
      WriteOnlyFunctionAdapter
    )
  }

  /**
   *
   * @param rs Accepts Class constructors or IRegistration
   */
  register (...rs: ({ new(...args: any[]): any } | IRegistration)[]) {
    this.registrar.unshift(
      ...rs.map((r) => {
        if (typeof r === 'function') {
          const { __prefix__: prefix, __key__: key, fromJSON, toJSON } = r as any

          return {
            item: r,
            prefix,
            key,
            fromJSON,
            toJSON
          }
        }

        return r
      }).map(({
        item: R, prefix, key, toJSON, fromJSON
      }) => {
        // @ts-ignore
        fromJSON = typeof fromJSON === 'undefined'
          ? (arg: any) => isClass(R) ? new R(arg) : arg
          : (fromJSON || undefined)
        key = this.getKey(prefix, key || (isClass(R)
          ? R.prototype.constructor.name
          : getFunctionName(R)))

        return {
          R,
          key,
          toJSON,
          fromJSON
        }
      })
    )
  }

  unregister (...rs: ({ new(...args: any[]): any } | IRegistration)[]) {
    this.registrar = this.registrar.filter(({ R, key }) => {
      return !rs.some((r) => {
        if (typeof r === 'function') {
          return r.constructor === R.constructor
        } else {
          return compareNotFalsy(r.key, key) || compareNotFalsy(r.item.constructor, R.constructor)
        }
      })
    })
  }

  /**
   *
   * @param obj Uses `JSON.stringify` by default
   */
  stringify (obj: any) {
    const pThis = this

    return this.stringifyFunction(obj, function (k, v, _this) {
      // @ts-ignore
      _this = this || _this
      const v0 = _this ? _this[k] : v
      if (['object', 'function'].indexOf(typeof v0) !== -1) {
        for (const { R, key, toJSON } of pThis.registrar) {
          if (compareNotFalsy(v0.constructor, (R.prototype || {}).constructor) ||
              compareNotFalsy(pThis.getKey(v0.__prefix__, v0.__name__ || (typeof v0 === 'function'
                ? 'Function'
                : undefined)), key)) {
            const parent = {} as any
            parent[key] = (
              (toJSON || (R.prototype || {}).toJSON || v0.toJSON || v0.toString).bind(v0)
            )(_this[k], parent)
            return parent
          }
        }
      }

      return v
    })
  }

  /**
   *
   * @param repr Uses `JSON.parse` by default
   */
  parse (repr: string) {
    return this.parseFunction(repr, (_, v) => {
      if (v && typeof v === 'object') {
        for (const { key, fromJSON } of this.registrar) {
          if (v[key]) {
            return typeof fromJSON === 'function' ? fromJSON(v[key], v) : v
          }
        }
      }
      return v
    })
  }

  private getKey (prefix: any, name: any) {
    return (typeof prefix === 'string' ? prefix : this.prefix) + name
  }
}

export const FullFunctionAdapter: IRegistration = {
  item: Function,
  toJSON: (_this) => functionToString(_this.toString()),
  fromJSON: (content: string) => {
    // eslint-disable-next-line no-new-func
    return new Function(content)
  }
}

export const WriteOnlyFunctionAdapter: IRegistration = (() => {
  return {
    ...FullFunctionAdapter,
    fromJSON: null
  }
})()

export * from './mongo'
export * from './utils'
