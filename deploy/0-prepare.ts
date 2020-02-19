import * as u from './utils'
console.log(u)

;(async () => {
  await u.spawnSafe('git', ['branch', 'gh-pages'])
  await u.spawnSafe('git', ['worktree', 'add', 'gh-pages', 'gh-pages'])
  await u.spawnSafe('git', ['rm', '-rf', '.'], {
    cwd: 'gh-pages'
  })
})().catch(console.error)
