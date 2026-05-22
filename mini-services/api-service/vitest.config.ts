import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['services/**/*.ts', 'lib/**/*.ts'],
      exclude: ['**/*.d.ts'],
    },
    testTimeout: 10000,
  },
})
