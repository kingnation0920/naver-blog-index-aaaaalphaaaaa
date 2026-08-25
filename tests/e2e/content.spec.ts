import { expect, test } from '@playwright/test';

test('category lists only matching articles', async ({ page }) => {
  await page.goto('/topics/notes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('마음 기록');
  await expect(page.getByRole('link', { name: '기분이 이상할 때 마주하는 내면의 신호' })).toBeVisible();
});

test('article includes Article JSON-LD and contextual counseling', async ({ page }) => {
  await page.goto('/articles/mood-inner-signal');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('기분이 이상할 때');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('Article');
  await expect(page.getByRole('link', { name: '상담 안내 보기' })).toBeVisible();
});
