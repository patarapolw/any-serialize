import * as u from './utils'
const { spawnSafe } = u

;(async () => {
  await spawnSafe('git', [
    'worktree',
    'remove',
    '-f',
    'gh-pages'
  ])

  await spawnSafe('git', [
    'branch',
    '-D',
    'gh-pages'
  ])
})().catch(console.error)
