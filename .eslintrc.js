module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "no-plusplus": 0,
    "no-bitwise": 0,
    "no-multi-assign": 0,
    "no-param-reassign": 0,
    "max-len": ["error", { code: 1050 }],
  },
};
