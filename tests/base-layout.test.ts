import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '@/layouts/BaseLayout.astro';

describe('BaseLayout', () => {
  it('renders Korean metadata and canonical URL', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: {
        title: '테스트 글',
        description: '테스트 설명',
        pathname: '/articles/test'
      },
      slots: {
        default: '본문'
      }
    });

    expect(html).toContain('<html lang="ko">');
    expect(html).toContain('<meta name="description" content="테스트 설명">');
    expect(html).toContain('<link rel="canonical" href="https://aiproductplanner.kr/articles/test">');
  });
});
