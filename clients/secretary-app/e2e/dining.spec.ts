import { test, expect } from './fixtures';

const LODGE_ID = 'test_lodge_001';

const MOCK_MEMBERS_RESPONSE = {
  page: 1,
  perPage: 30,
  totalPages: 1,
  totalItems: 3,
  items: [
    {
      id: 'mem_001',
      lodge_id: LODGE_ID,
      first_name: 'James',
      last_name: 'Whitfield',
      rank: 'W Bro',
      status: 'active',
      collectionId: 'pbc_3572739349',
      collectionName: 'members',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mem_002',
      lodge_id: LODGE_ID,
      first_name: 'Richard',
      last_name: 'Pemberton',
      rank: 'Bro',
      status: 'active',
      collectionId: 'pbc_3572739349',
      collectionName: 'members',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
    {
      id: 'mem_003',
      lodge_id: LODGE_ID,
      first_name: 'George',
      last_name: 'Sinclair',
      rank: 'Bro',
      status: 'active',
      collectionId: 'pbc_3572739349',
      collectionName: 'members',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
  ],
};

const MOCK_DINING_RESPONSE = {
  page: 1,
  perPage: 30,
  totalPages: 1,
  totalItems: 3,
  items: [
    {
      id: 'din_001',
      lodge_id: LODGE_ID,
      member_id: 'mem_001',
      meeting_date: '2026-03-14T18:30:00Z',
      status: 'dining',
      updated_by: 'seed',
      collectionId: 'pbc_2053535107',
      collectionName: 'dining_records',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
    {
      id: 'din_002',
      lodge_id: LODGE_ID,
      member_id: 'mem_002',
      meeting_date: '2026-03-14T18:30:00Z',
      status: 'not_dining',
      updated_by: 'seed',
      collectionId: 'pbc_2053535107',
      collectionName: 'dining_records',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
    {
      id: 'din_003',
      lodge_id: LODGE_ID,
      member_id: 'mem_003',
      meeting_date: '2026-03-14T18:30:00Z',
      status: 'undecided',
      updated_by: 'seed',
      collectionId: 'pbc_2053535107',
      collectionName: 'dining_records',
      created: '2026-01-01T00:00:00Z',
      updated: '2026-01-01T00:00:00Z',
    },
  ],
};

test.describe('Dining Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/collections/members/records**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_MEMBERS_RESPONSE),
      }),
    );

    await page.route('**/api/collections/dining_records/records**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_DINING_RESPONSE),
        });
      }
      return route.continue();
    });
  });

  test('renders members with their dining statuses', async ({ page }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);

    await expect(page.getByText('Festive Board Dining')).toBeVisible();
    await expect(page.getByText('Whitfield, James')).toBeVisible();
    await expect(page.getByText('Pemberton, Richard')).toBeVisible();
    await expect(page.getByText('Sinclair, George')).toBeVisible();

    await expect(page.getByText('1 dining')).toBeVisible();
    await expect(page.getByText('1 not dining')).toBeVisible();
    await expect(page.getByText('1 undecided')).toBeVisible();
  });

  test('optimistic update reflects immediately on toggle', async ({ page }) => {
    let updateResolve: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      updateResolve = resolve;
    });

    await page.route(
      '**/api/collections/dining_records/records/din_002**',
      async (route) => {
        if (route.request().method() === 'PATCH') {
          // Hold the response to verify optimistic state
          await updatePromise;
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ...MOCK_DINING_RESPONSE.items[1],
              status: 'dining',
            }),
          });
        }
        return route.continue();
      },
    );

    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('1 dining')).toBeVisible();

    // Find the toggle for Pemberton (currently not_dining) and click "Dining"
    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('radio', { name: 'Dining' }).click();

    // UI should update optimistically before server responds
    await expect(page.getByText('2 dining')).toBeVisible();
    await expect(page.getByText('0 not dining')).toBeVisible();

    // Release the server response
    updateResolve!();
  });

  test('rolls back on server error', async ({ page }) => {
    await page.route(
      '**/api/collections/dining_records/records/din_002**',
      (route) => {
        if (route.request().method() === 'PATCH') {
          return route.fulfill({ status: 500 });
        }
        return route.continue();
      },
    );

    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('1 not dining')).toBeVisible();

    const pembertonRow = page.getByRole('row').filter({ hasText: 'Pemberton' });
    await pembertonRow.getByRole('radio', { name: 'Dining' }).click();

    // Optimistic update shows briefly
    await expect(page.getByText('2 dining')).toBeVisible();

    // After server error, should roll back
    await expect(page.getByText('1 not dining')).toBeVisible({ timeout: 5000 });
  });

  test('dining dashboard is accessible', async ({
    page,
    makeAxeBuilder,
  }) => {
    await page.goto(`/#/dining/${LODGE_ID}`);
    await expect(page.getByText('Festive Board Dining')).toBeVisible();

    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
});
