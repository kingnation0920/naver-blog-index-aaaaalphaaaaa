import { expect, test } from '@playwright/test';

test('counseling falls back to on-page contact guidance', async ({ page }) => {
  await page.goto('/counseling');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('상담 안내');
  await expect(page.getByText('연락 채널을 준비하고 있습니다.')).toBeVisible();
});

test('core pages expose production canonical metadata', async ({ page }) => {
  for (const path of ['/', '/topics/work', '/articles/work-boundary', '/counseling']) {
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
