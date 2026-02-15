import { test, expect } from '@playwright/test';
import { mockLodgeRoutes } from './helpers/mock-routes';

test.beforeEach(async ({ page }) => {
  await mockLodgeRoutes(page);
});

test('layout shell renders with app title', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('banner')).toContainText('Festive Board Manager');
});

test('lodge data renders on the page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Lodge of Harmony No. 255')).toBeVisible();
  await expect(page.getByText('Metropolitan')).toBeVisible();
});
