import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 纯逻辑层测试无需 DOM，node 环境启动更快
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // index.ts 强依赖 canvas DOM，暂不纳入纯逻辑层覆盖率统计
      exclude: ['src/index.ts'],
    },
  },
});
