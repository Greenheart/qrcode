import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    includeSource: ['lib/**/*.{ts,js}', 'test/**/*.ts'],
  },
})
