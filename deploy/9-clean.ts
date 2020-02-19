import { spawnSafe } from './utils'

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
