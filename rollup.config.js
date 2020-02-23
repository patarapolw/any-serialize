import typescript from '@rollup/plugin-typescript'
import minify from 'rollup-plugin-babel-minify'

const getConfig = (output, isMin) => {
  return {
    input: 'src/index.ts',
    output: {
      file: output,
      format: 'esm'
    },
    plugins: [
      typescript({
        module: 'esnext'
      }),
      ...(isMin ? [
        minify()
      ] : [])
    ]
  }
}

export default [
  getConfig('lib/index.mjs'),
  getConfig('lib/index.min.mjs', true)
]
