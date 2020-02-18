import { Serialize, MongoDateProp, MongoRegExpProp } from '../src'

const ser = new Serialize([MongoDateProp, MongoRegExpProp])

describe('mongo by using this module', () => {
  it('mongo by using this module', () => {
    const r = ser.stringify({
      a: new Date(),
      r: /^hello /gi
    })

    console.log(r)
    // {"a":{"$date":"2020-02-18T14:43:18.158Z"},"r":{"$options":"gi","$regex":"^hello "}}
    console.log(ser.parse(r))
    // { a: 2020-02-18T14:46:11.444Z, r: /^hello /gi }
  })
})
