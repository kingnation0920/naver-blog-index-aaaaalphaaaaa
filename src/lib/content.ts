export const categoryMeta = {
  work: { label: '일', route: '/topics/work' },
  relationships: { label: '관계', route: '/topics/relationships' },
  family: { label: '가족', route: '/topics/family' },
  notes: { label: '마음 기록', route: '/topics/notes' }
} as const;

export type Category = keyof typeof categoryMeta;

export function sortNewestFirst<T extends { data: { publishedAt: Date } }>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}
