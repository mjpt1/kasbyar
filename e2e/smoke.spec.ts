import { test, expect } from '@playwright/test';

const email = process.env.E2E_EMAIL || 'demo@kesbyar.ir';
const password = process.env.E2E_PASSWORD || 'demo1234';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await Promise.all([
    page.waitForURL(/\/(dashboard|onboarding|workspace|settings|invoices)/, { timeout: 60_000 }),
    page.locator('form button[type="submit"]').click(),
  ]);
}

test.describe('KasbYar minimal smoke', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('login success redirects', async ({ page }) => {
    await login(page);
    expect(page.url()).not.toContain('/login');
  });

  test('settings loads when authenticated', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('body')).toContainText(/تنظیمات|یکپارچ|درگاه|سازمان/);
  });

  test('invoices list accessible', async ({ page }) => {
    await login(page);
    await page.goto('/invoices');
    await expect(page).toHaveURL(/invoices/);
    await expect(page.locator('body')).toContainText(/فاکتور|صورتحساب/);
  });

  test('public pay invalid token is graceful', async ({ page }) => {
    const res = await page.goto('/pay/invalid-token-e2e');
    expect(res?.status() ?? 0).toBeLessThan(500);
    await expect(page.locator('body')).not.toContainText(/Application error/i);
  });
});
