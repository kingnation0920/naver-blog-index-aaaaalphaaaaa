import { expect, test } from '@playwright/test';

const routes = ['/', '/topics/work', '/articles/work-boundary', '/counseling', '/404'];

test('homepage remains within required viewport widths', async ({ page }) => {
  for (const width of [320, 768, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const { headingRight, scrollWidth, viewportWidth } = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.getBoundingClientRect();
      return {
        headingRight: heading?.right ?? 0,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth
      };
    });

    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);
    expect(headingRight).toBeLessThanOrEqual(viewportWidth);
  }
});

test('core pages fit the viewport and expose visible keyboard navigation', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route);

    const { scrollWidth, viewportWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    expect(scrollWidth).toBeLessThanOrEqual(viewportWidth);

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: '본문으로 건너뛰기' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
  }
});

test('mobile menu opens shared navigation', async ({ page }, testInfo) => {
  test.skip((testInfo.project.use.viewport?.width ?? 0) > 820, 'mobile only');

  await page.goto('/');
  const menu = page.locator('summary');
  await expect(menu).toBeVisible();
  expect((await menu.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  await menu.click();
  await expect(page.getByRole('navigation', { name: '모바일 주요 메뉴' })).toBeVisible();
  const linkHeights = await page
    .getByRole('navigation', { name: '모바일 주요 메뉴' })
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  expect(linkHeights.every((height) => height >= 44)).toBe(true);
  await expect(page.getByRole('link', { name: '상담 안내' }).last()).toBeVisible();
});
