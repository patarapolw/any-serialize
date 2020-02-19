import { spawn, SpawnOptionsWithoutStdio } from 'child_process'

export async function spawnSafe (cmd: string, args: string[], options: SpawnOptionsWithoutStdio = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: 'inherit',
      ...options
    })
    p.on('exit', (err) => err ? reject(err) : resolve())
  })
}
