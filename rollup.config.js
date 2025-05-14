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

const pkg = JSON.parse(
  await import("fs").then((fs) => fs.promises.readFile("package.json", "utf8"))
);

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

const baseConfig = {
  input: "src/index.ts",
  plugins: [
    babel({ babelHelpers: "bundled" }),
    typescript({
      tsconfig: "tsconfig.json",
    }),
    json(),
    ...mergePlugins,
  ],
};

export default [
  // UMD 构建
  {
    ...baseConfig,
    output: {
      file: "lib/canvas-select.min.js",
      format: "umd",
      name: "CanvasSelect",
      exports: "auto",
      sourcemap: true,
      banner,
    },
  },
  // ES 构建
  {
    ...baseConfig,
    output: {
      file: "lib/canvas-select.esm.js",
      format: "es",
      exports: "auto",
      sourcemap: true,
      banner,
    },
  },
];
