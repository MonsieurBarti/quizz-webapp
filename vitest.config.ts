import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/cypress/**', '**/.{idea,git,cache,output,temp}/**'],
    globals: true, // This enables global test functions like describe, it, etc.
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@quizz-creator': resolve(__dirname, './src/server/modules/quizz-creator'),
      '@quizz-taker': resolve(__dirname, './src/server/modules/quizz-taker'),
    },
  },
});
