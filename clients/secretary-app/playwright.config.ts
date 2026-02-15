import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Limit to 1 worker in CI to avoid resource contention on shared runners;
  // omit locally so Playwright uses its default parallelism.
  // Spread (not ternary) because `exactOptionalPropertyTypes` forbids `undefined`
  // for a property typed as `string | number`.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:9000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: process.env.CI
      ? 'npx http-server dist/spa -p 9000 -s'
      : 'pnpm dev',
    url: 'http://localhost:9000',
    reuseExistingServer: !process.env.CI,
  },
});
