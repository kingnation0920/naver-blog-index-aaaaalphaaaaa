import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from '@/components/Header.astro';
import ConsultationCTA from '@/components/ConsultationCTA.astro';

describe('shared navigation', () => {
  it('exposes every topic, counseling, and skip navigation route', async () => {
    const container = await AstroContainer.create();
    const header = await container.renderToString(Header);
    const cta = await container.renderToString(ConsultationCTA);

    for (const route of [
      '/topics/work',
      '/topics/relationships',
      '/topics/family',
      '/topics/notes',
      '/counseling'
    ]) {
      expect(header).toContain(route);
    }

    expect(header).toContain('href="#main-content"');
    expect(header).toContain('<details');
    expect(cta).toContain('/counseling');
    expect(cta).toContain('더 읽는 것만으로 정리되지 않을 때');
  });
});
