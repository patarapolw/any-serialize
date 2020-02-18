import { Serialize, MongoDateProp, MongoRegExpProp } from '../src'

const ser = new Serialize([MongoDateProp, MongoRegExpProp])

const r = ser.stringify({
  a: new Date(),
  r: /^hello /gi
})

console.log(r)
// {"a":{"$Date":"2020-02-17T13:37:42.279Z"},"r":{"$RegExp":{"source":"^hello$","flags":""}},"c":{"$custom_name":{"a":1,"b":3}}}
console.log(ser.parse(r))
// { a: 2020-02-17T13:37:42.279Z,
//   r: /^hello$/,
//   c: CustomClass { a: 1, b: 3 } }
