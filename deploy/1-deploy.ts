import fs from 'fs-extra'
import glob from 'glob'

import * as u from './utils'
const { spawnSafe } = u

;(async () => {
  await spawnSafe('yarn', ['build'])

  await new Promise((resolve, reject) => {
    glob('lib/**/*.js', (err, matches) => {
      if (err) {
        reject(err)
      }

      matches.map((m) => {
        const s = fs.readFileSync(m, 'utf8').replace(
          /(?<start>^|\n)(?<pre>(?:im|ex)port .+)(?<bOpen>['"])(?<name>.+?)(?<ext>\.[tj]?s)?(?<bClose>['"])/g,
          '$<start>$<pre>$<bOpen>$<name>.js$<bClose>'
        )
        fs.ensureFileSync(`gh-pages/${m}`)
        fs.writeFileSync(`gh-pages/${m}`, s)
      })
      resolve()
    })
  })

  const s = fs.readFileSync('deploy/index.html', 'utf8').replace(
    '/** script **/',
    fs.readFileSync('deploy/script.js', 'utf8')
  )
  fs.writeFileSync('gh-pages/index.html', s)

  await spawnSafe('git', ['add', '.'], {
    cwd: 'gh-pages'
  })
  await spawnSafe('git', ['commit', '-m', 'deploy'], {
    cwd: 'gh-pages'
  })
  await spawnSafe('git', ['push', 'origin', 'gh-pages'], {
    cwd: 'gh-pages'
  })
})().catch(console.error)
