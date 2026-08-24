import { describe, expect, it } from 'vitest';
import { categoryMeta, sortNewestFirst } from '@/lib/content';

describe('category metadata', () => {
  it('maps work category', () => {
    expect(categoryMeta.work).toEqual({ label: '일', route: '/topics/work' });
  });

  it('maps remaining categories', () => {
    expect(categoryMeta.relationships).toEqual({
      label: '관계',
      route: '/topics/relationships'
    });
    expect(categoryMeta.family).toEqual({ label: '가족', route: '/topics/family' });
    expect(categoryMeta.notes).toEqual({ label: '마음 기록', route: '/topics/notes' });
  });
});

describe('sortNewestFirst', () => {
  it('sorts newest first without mutating input', () => {
    const older = { data: { publishedAt: new Date('2024-01-01') } };
    const newer = { data: { publishedAt: new Date('2025-01-01') } };
    const entries = [older, newer] as const;

    expect(sortNewestFirst(entries)).toEqual([newer, older]);
    expect(entries).toEqual([older, newer]);
  });
});
