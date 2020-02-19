import { Serialize, MongoDateAdapter, MongoRegExpAdapter } from '../src/index'

describe('mongo by using this module', () => {
  const ser = new Serialize()
  ser.register(MongoDateAdapter, MongoRegExpAdapter)

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
