describe('mongo without dependencies', () => {
  it('mongo without dependencies', () => {
    const cond = {
      a: new Date(),
      b: /regexp/gi
    }

    const r = JSON.stringify(cond, function (k, v) {
      const v0 = this[k]
      if (v0) {
        if (v0 instanceof Date) {
          return { $date: v0.toISOString() }
        } else if (v0 instanceof RegExp) {
          return { $regex: v0.source, $options: v0.flags }
        }
      }
      return v
    })

    console.log(r)
    // {"a":{"$date":"2020-02-18T14:43:18.154Z"},"b":{"$regex":"regexp","$options":"gi"}}

    console.log(JSON.parse(r, (_, v) => {
      if (v && typeof v === 'object') {
        if (v.$date) {
          return new Date(v.$date)
        } else if (v.$regex) {
          return new RegExp(v.$regex, v.$options)
        }
      }
      return v
    }))
    // { a: 2020-02-18T14:43:18.154Z, b: /regexp/gi }
  })
})
