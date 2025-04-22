import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

const mergePlugins = process.env.NODE_ENV === 'development' ?
  [serve({ open: true }), livereload({ watch: 'lib' })] : [terser()]

const baseConfig = {
  input: 'src/index.ts',
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    typescript({
      tsconfig: "tsconfig.json"
    }),
    json(),
    ...mergePlugins
  ]
}

export default [
  // UMD 构建
  {
    ...baseConfig,
    output: {
      file: 'lib/canvas-select.min.js',
      format: 'umd',
      name: 'CanvasSelect',
      exports: 'auto',
      sourcemap: true,
    }
  },
  // ES 构建
  {
    ...baseConfig,
    output: {
      file: 'lib/canvas-select.esm.js',
      format: 'es',
      exports: 'auto',
      sourcemap: true
    }
  }
];
