import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Fixtures = {
  makeAxeBuilder: () => AxeBuilder;
};

/**
 * Extended Playwright test with accessibility audit support.
 *
 * Usage:
 * ```ts
 * import { test, expect } from './fixtures';
 *
 * test('page is accessible', async ({ page, makeAxeBuilder }) => {
 *   await page.goto('/');
 *   const results = await makeAxeBuilder().analyze();
 *   expect(results.violations).toEqual([]);
 * });
 * ```
 */
export const test = base.extend<Fixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .exclude('vite-plugin-checker-error-overlay'),
    );
  },
});

export { expect } from '@playwright/test';
