import * as u from './utils'
const { spawnSafe } = u

;(async () => {
  await spawnSafe('git', ['branch', 'gh-pages'])
  await spawnSafe('git', ['worktree', 'add', 'gh-pages', 'gh-pages'])
  await spawnSafe('git', ['rm', '-rf', '.'], {
    cwd: 'gh-pages'
  })
  await spawnSafe('touch', ['.nojekyll'], {
    cwd: 'gh-pages'
  })
})().catch(console.error)
