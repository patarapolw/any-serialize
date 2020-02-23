import typescript from '@rollup/plugin-typescript'
import minify from 'rollup-plugin-babel-minify'

const getConfig = ({ output, format = 'esm', isMinify }) => {
  return {
    input: 'src/index.ts',
    output: {
      file: output,
      format
    },
    plugins: [
      typescript({
        module: 'esnext'
      }),
      ...(isMinify ? [
        minify()
      ] : [])
    ]
  }
}

export default [
  getConfig({ output: 'lib/index.mjs' }),
  getConfig({ output: 'lib/index.min.mjs', isMinify: true })
]
