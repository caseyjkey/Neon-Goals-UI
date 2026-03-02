import { test, expect } from '@playwright/test';

/**
 * Basic smoke test to verify the app loads.
 * This is a placeholder that can be expanded as the test suite grows.
 */
test.describe('App smoke tests', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the root element to be visible
    await expect(page.locator('#root')).toBeVisible();
  });
});
