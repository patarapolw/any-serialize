import fs from 'fs-extra'
import glob from 'glob'

import * as u from './utils'
const { spawnSafe } = u

;(async () => {
  // await spawnSafe('yarn', ['build'])

  await new Promise((resolve, reject) => {
    glob('lib/**/*.mjs', (err, matches) => {
      if (err) {
        reject(err)
      }

      matches.map((m) => {
        fs.ensureFileSync(`gh-pages/${m}`)
        fs.copyFileSync(m, `gh-pages/${m}`)
      })
      resolve()
    })
  })

  const s = fs.readFileSync('deploy/index.html', 'utf8').replace(
    '/** script **/',
    '\n' + fs.readFileSync('deploy/script.js', 'utf8')
  )
  fs.writeFileSync('gh-pages/index.html', s)

  if (process.env.PUSH !== '0') {
    await spawnSafe('git', ['add', '.'], {
      cwd: 'gh-pages'
    })
    await spawnSafe('git', ['commit', '-m', 'deploy'], {
      cwd: 'gh-pages'
    })
    await spawnSafe('git', ['push', 'origin', 'gh-pages'], {
      cwd: 'gh-pages'
    })
  }
})().catch(console.error)
