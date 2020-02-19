import * as fs from 'fs-extra'
import glob from 'glob'

import * as u from './utils'

;(async () => {
  await u.spawnSafe('yarn', ['build'])

  await new Promise((resolve, reject) => {
    glob('lib/**/*.js', (err, matches) => {
      if (err) {
        reject(err)
      }

      matches.map((m) => {
        const s = fs.readFileSync(m, 'utf8').replace(
          /^(?<pre>import .+)(?<bOpen>['"])(?<name>.+?)(?<ext>\.[tj]?s)?(?<bClose>['"])/g,
          '$<pre>$<bOpen>$<name>.js$<bClose>'
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

  await u.spawnSafe('git', ['add', '.'], {
    cwd: 'gh-pages'
  })
  await u.spawnSafe('git', ['commit', '-m', 'deploy'], {
    cwd: 'gh-pages'
  })
  await u.spawnSafe('git', ['push', 'origin', 'gh-pages'], {
    cwd: 'gh-pages'
  })
})().catch(console.error)
