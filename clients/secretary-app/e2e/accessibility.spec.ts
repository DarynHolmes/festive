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

test('skip-to-content link targets page content', async ({ page }) => {
  await page.goto('/');

  const skipLink = page.getByRole('link', { name: 'Skip to content' });
  await expect(skipLink).toHaveAttribute('href', '#main-content');
  await expect(page.locator('#main-content')).toBeAttached();
});

test('page has a main landmark via QPage', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Lodge of Harmony No. 255').waitFor();

  await expect(page.getByRole('main')).toBeVisible();
});
