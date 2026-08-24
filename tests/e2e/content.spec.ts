import { expect, test } from '@playwright/test';

test('category lists only matching articles', async ({ page }) => {
  await page.goto('/topics/work');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('일');
  await expect(page.getByRole('link', { name: '일이 끝난 뒤에도 마음이 퇴근하지 못할 때' })).toBeVisible();
  await expect(page.getByRole('link', { name: '가족의 대화가 같은 자리로 돌아올 때' })).toHaveCount(0);
});

test('article includes Article JSON-LD and contextual counseling', async ({ page }) => {
  await page.goto('/articles/work-boundary');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('마음이 퇴근하지 못할 때');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('Article');
  await expect(page.getByRole('link', { name: '상담 안내 보기' })).toBeVisible();
});
