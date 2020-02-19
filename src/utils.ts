export type StringifyFunction = (
  obj: any,
  replacer: (k: string, v: any, _this?: any) => any
) => string

export type ParseFunction = (
  repr: string,
  reviver: (k: string, v: any) => any
) => any

export interface IRegistration {
  item: Function | RegExpConstructor
  prefix?: string
  key?: string
  toJSON?: (_this: any, parent: any) => any,
  fromJSON?: ((current: any, parent: any) => any) | null
}

export function isClass (k: any): k is { prototype: { constructor: any } } {
  return !!(k.prototype && k.prototype.constructor)
}

export function compareNotFalsy (a: any, b: any) {
  return !!a && a === b
}

export function getFunctionName (R: Function) {
  return R.toString().replace(/^function /, '').split('(')[0]
}

export function functionToString (R: Function) {
  return R.toString().replace(/^.+?\{/s, '').replace(/\}.*$/s, '').trim()
}
