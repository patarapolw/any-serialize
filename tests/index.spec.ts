import { Serialize } from '../src'

declare global {
  interface RegExp {
    toJSON(): any
  }

  interface RegExpConstructor {
    fromJSON(opts: {
      source: string
      flags: string
    }): RegExp
  }
}

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
