import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import typescript from "rollup-plugin-typescript2";

const mergePlugins =
  process.env.NODE_ENV === "development"
    ? [serve({ open: true }), livereload({ watch: "lib" })]
    : [terser()];

export default {
  input: "src/index.ts",
  output: {
    exports: "auto",
    file: "lib/canvas-select.min.js",
    format: "umd",
    name: "CanvasSelect",
    sourcemap: true,
  },
  plugins: [
    babel({ babelHelpers: "bundled" }),
    typescript({
      tsconfig: "tsconfig.json",
    }),
    json(),
    ...mergePlugins,
  ],
};
