module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  // 只保留能发现真实缺陷的规则，不约束缩进、引号、空行等排版风格
  rules: {
    // 库本身大量使用 any 与非空断言，属于既有设计取舍
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    // 代码中大量使用 `cond && expr()` 短路写法，属于既有风格
    "@typescript-eslint/no-unused-expressions": "off",
    // 未使用变量只告警，且允许下划线前缀占位
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // 真正能抓 bug 的规则
    eqeqeq: ["error", "always", { null: "ignore" }],
    "no-var": "error",
    "prefer-const": "error",
    "no-unsafe-optional-chaining": "error",
    "no-constant-binary-expression": "error",
    "no-self-compare": "error",
    "no-unmodified-loop-condition": "error",
    "no-unreachable-loop": "error",
    "no-promise-executor-return": "error",
    "no-template-curly-in-string": "error",
    "require-atomic-updates": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
  overrides: [
    {
      files: ["test/**/*.ts"],
      env: { node: true },
    },
  ],
};
