import { expect, test } from '@playwright/test';

test('counseling falls back to on-page contact guidance', async ({ page }) => {
  await page.goto('/counseling');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('상담 안내');
  await expect(page.getByRole('link', { name: '카카오톡 상담', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '상담 예약', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '상담 공간 위치', exact: true })).toBeVisible();
});

test('core pages expose production canonical metadata', async ({ page }) => {
  for (const path of ['/', '/topics/notes', '/articles/mood-inner-signal', '/counseling']) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`^https://aiproductplanner\\.kr${path === '/' ? '/?$' : `${path}/?$`}`)
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  }
});

test('robots points crawlers to the production sitemap', async ({ request }) => {
  const response = await request.get('/robots.txt');
  expect(response.ok()).toBe(true);
  await expect(response.text()).resolves.toContain(
    'Sitemap: https://aiproductplanner.kr/sitemap-index.xml'
  );
});
