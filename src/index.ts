import {
  StringifyFunction, ParseFunction, IRegistration,
  isClassConstructor, getFunctionName, compareNotFalsy, cyrb53, extractObjectFromClass
} from './utils'
import { getTypeofDetailed, isArray, isObject } from './type'

export class Serialize {
  private registrar: {
    R?: Function
    key: any
    toJSON?: (_this: any, parent: any) => any
    fromJSON?: (current: any, parent: any) => any
  }[] = []

  private prefix = '__'
  private stringifyFunction: StringifyFunction = JSON.stringify
  private parseFunction: ParseFunction = JSON.parse

  private undefinedProxy = Symbol('undefined')

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
      WriteOnlyFunctionAdapter,
      {
        item: Set,
        toJSON (_this) {
          return Array.from(_this)
        }
      },
      {
        key: 'Infinity',
        toJSON (_this: number) {
          return _this.toString()
        },
        fromJSON (current: string) {
          return Number(current)
        }
      },
      {
        key: 'bigint',
        toJSON (_this: BigInt) {
          return _this.toString()
        },
        fromJSON (current: string) {
          return BigInt(current)
        }
      },
      {
        key: 'symbol',
        toJSON (_this: Symbol) {
          return {
            content: _this.toString(),
            rand: Math.random().toString(36).substr(2)
          }
        },
        fromJSON ({ content }) {
          return Symbol(content.replace(/^Symbol\(/i, '').replace(/\)$/, ''))
        }
      },
      {
        key: 'NaN',
        toJSON: () => 'NaN',
        fromJSON: () => NaN
      }
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
          ? (arg: any) => isClassConstructor(R) ? new R(arg) : arg
          : (fromJSON || undefined)
        key = this.getKey(prefix, key || (isClassConstructor(R)
          ? R.prototype.constructor.name
          : typeof R === 'function' ? getFunctionName(R) : R))

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
          return !!R && r.constructor === R.constructor
        } else {
          return compareNotFalsy(r.key, key) || (!!r.item && !!R && compareNotFalsy(r.item.constructor, R.constructor))
        }
      })
    })
  }

  /**
   *
   * @param obj Uses `JSON.stringify` with sorter Array by default
   */
  stringify (obj: any) {
    const clonedObj = this.deepCloneAndFindAndReplace([obj], 'jsonCompatible')[0]

    const keys = new Set<string>()
    const getAndSortKeys = (a: any) => {
      if (a) {
        if (typeof a === 'object' && a.constructor.name === 'Object') {
          for (const k of Object.keys(a)) {
            keys.add(k)
            getAndSortKeys(a[k])
          }
        } else if (Array.isArray(a)) {
          a.map((el) => getAndSortKeys(el))
        }
      }
    }
    getAndSortKeys(clonedObj)
    return this.stringifyFunction(clonedObj, Array.from(keys).sort())
  }

  hash (obj: any) {
    return cyrb53(this.stringify(obj)).toString(36)
  }

  clone<T> (obj: T): T {
    return this.deepCloneAndFindAndReplace([obj], 'clone')[0]
  }

  deepEqual (o1: any, o2: any): boolean {
    const t1 = getTypeofDetailed(o1)
    const t2 = getTypeofDetailed(o2)

    if (t1.typeof_ === 'function' || t1.typeof_ === 'object') {
      if (isArray(o1, t1)) {
        return o1.map((el1, k) => {
          return this.deepEqual(el1, o2[k])
        }).every((el) => el)
      } else if (isObject(o1, t1)) {
        return Object.entries(o1).map(([k, el1]) => {
          return this.deepEqual(el1, o2[k])
        }).every((el) => el)
      } else {
        return this.hash(o1) === this.hash(o2)
      }
    } else if (t1.is[0] === 'NaN' && t2.is[0] === 'NaN') {
      /**
       * Cannot compare directly because of infamous `NaN !== NaN`
       */
      return this.hash(o1) === this.hash(o2)
    }

    return o1 === o2
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
    return (typeof prefix === 'string' ? prefix : this.prefix) + (name || '')
  }

  /**
   *
   * @param o
   * @param type Type of findAndReplace
   */
  private deepCloneAndFindAndReplace (o: any, type: 'jsonCompatible' | 'clone') {
    const t = getTypeofDetailed(o)

    if (t.is[0] === 'Array') {
      const obj = [] as any[]
      o.map((el: any, i: number) => {
        const v = this.deepCloneAndFindAndReplace(el, type)
        /**
         * `undefined` can't be ignored in serialization, and will be JSON.stringify as `null`
         */
        if (v === this.undefinedProxy) {
          obj[i] = undefined
        } else {
          obj[i] = v
        }
      })

      return obj
    } else if (t.is[0] === 'object') {
      const obj = {} as any
      Object.entries(o).map(([k, el]) => {
        const v = this.deepCloneAndFindAndReplace(el, type)
        if (v === undefined) {

        } else if (v === this.undefinedProxy) {
          obj[k] = undefined
        } else {
          obj[k] = v
        }
      })

      return obj
    } else if (t.is[0] === 'Named') {
      const k = this.getKey(o.__prefix__, o.__name__ || o.constructor.name)

      for (const { R, key, toJSON, fromJSON } of this.registrar) {
        if ((!!R && compareNotFalsy(o.constructor, R)) ||
            compareNotFalsy(k, key)) {
          if (!fromJSON && type === 'clone') {
            continue
          }

          const p = {} as any
          p[key] = (
            (toJSON || (!!R && R.prototype.toJSON) || o.toJSON || o.toString).bind(o)
          )(o, p)

          if (p[key] === undefined) {
            return undefined
          } else if (type === 'clone') {
            return fromJSON!(p[key], p)
          } else {
            return p
          }
        }
      }

      if (type === 'clone') {
        return o
      } else {
        return {
          [k]: extractObjectFromClass(o)
        }
      }
    } else if (t.is[0] === 'Constructor' || t.is[0] === 'function' || t.is[0] === 'Infinity' ||
        t.is[0] === 'bigint' || t.is[0] === 'symbol' || t.is[0] === 'NaN') {
      let is = t.is[0]
      if (is === 'Constructor') {
        is = 'function'
      }

      /**
       * functions should be attempted to be deep-cloned first
       * because functions are objects and can be attach properties
       */
      if (type === 'clone' && is !== 'function') {
        return o
      }

      const k = this.getKey(undefined, is)
      const { R, toJSON, fromJSON } = this.registrar.filter(({ key }) => key === k)[0] || {}

      if (type === 'clone' && !fromJSON) {
        return o
      }

      const p = {} as any
      p[k] = (
        (toJSON || (!!R && R.prototype.toJSON) || o.toJSON || o.toString).bind(o)
      )(o, p)

      if (type === 'clone') {
        return fromJSON!(p[k], p)
      } else if (p[k] === undefined) {
        return undefined
      } else {
        return p
      }
    } else if (t.is[0] === 'undefined') {
      if (type === 'clone') {
        return this.undefinedProxy
      }

      const k = this.getKey(undefined, t.is[0])
      const { R, toJSON } = this.registrar.filter(({ key }) => key === k)[0] || {}

      const p = {} as any
      p[k] = (
        (toJSON || (!!R && R.prototype.toJSON) || (() => {})).bind(o)
      )(o, p)

      return p[k] === undefined ? undefined : p
    }

    return o
  }
}

export const FullFunctionAdapter: IRegistration = {
  key: 'function',
  toJSON: (_this) => _this.toString().trim().replace(/\[native code\]/g, ' ').replace(/[\t\n\r ]+/g, ' '),
  fromJSON: (content: string) => {
    // eslint-disable-next-line no-new-func
    return new Function(`return ${content}`)()
  }
}

export const WriteOnlyFunctionAdapter: IRegistration = {
  ...FullFunctionAdapter,
  fromJSON: null
}

export const UndefinedAdapter: IRegistration = {
  key: 'undefined',
  toJSON: () => 'undefined',
  fromJSON: () => undefined
}

export * from './mongo'
export * from './utils'
