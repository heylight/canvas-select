import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/main.ts',
  output: {
    exports: 'auto',
    file: 'lib/canvas-select.min.js',
    format: 'umd',
    name: 'CanvasSelect',
    sourcemap: true,
  },
  plugins: [
    sourcemaps(),
    typescript(),
    babel({ babelHelpers: 'bundled' }),
    uglify(),
  ],
};
