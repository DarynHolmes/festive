import { test, expect } from './fixtures';
import { mockLodgeRoutes } from './helpers/mock-routes';

test.beforeEach(async ({ page }) => {
  await mockLodgeRoutes(page);
});

test('default page has no WCAG 2.2 AA violations', async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto('/');
  await page.getByText('Lodge of Harmony No. 255').waitFor();

  const results = await makeAxeBuilder().analyze();

  expect(results.violations).toEqual([]);
});
