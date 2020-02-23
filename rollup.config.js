import typescript from '@rollup/plugin-typescript'
import minify from 'rollup-plugin-babel-minify'

const getConfig = ({ output, isMinify }) => {
  return {
    input: 'src/index.ts',
    output: {
      file: output,
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      typescript({
        module: 'esnext'
      }),
      ...(isMinify ? [
        minify({
          comments: false
        })
      ] : [])
    ]
  }
}

export default [
  getConfig({ output: 'lib/index.mjs' }),
  getConfig({ output: 'lib/index.min.mjs', isMinify: true })
]
