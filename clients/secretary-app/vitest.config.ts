import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      stores: resolve(__dirname, 'src/stores'),
      components: resolve(__dirname, 'src/components'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
