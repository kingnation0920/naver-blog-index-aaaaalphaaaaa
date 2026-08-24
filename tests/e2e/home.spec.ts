import { expect, test } from '@playwright/test';

test('home presents the archive before counseling', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('마음을 읽는 기준');
  await expect(page.getByRole('link', { name: '글 둘러보기' })).toBeVisible();
  await expect(page.locator('main article').first()).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '더 읽는 것만으로 정리되지 않을 때' })
  ).toBeVisible();

  const articleBeforeConsultation = await page.evaluate(() => {
    const article = document.querySelector('main article');
    const consultation = document.querySelector('#consultation-title');
    return Boolean(
      article &&
        consultation &&
        article.compareDocumentPosition(consultation) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  expect(articleBeforeConsultation).toBe(true);
});
