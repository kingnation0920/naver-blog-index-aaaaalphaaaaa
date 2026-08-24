# 감정 아카이브 웹사이트 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 일·관계·가족 심리 콘텐츠를 읽고 필요할 때 상담으로 이동할 수 있는 반응형 독립 브랜드 웹사이트를 구축한다.

**Architecture:** Astro 정적 사이트 생성과 빌드 타임 content collection을 사용한다. 브랜드 설정, 콘텐츠, 표현 컴포넌트를 분리해 최종 브랜드명과 원고를 레이아웃 수정 없이 교체한다. 메인·주제·글·상담·404 페이지를 정적으로 생성하고 Vitest, Astro check, Playwright로 검증한다.

**Tech Stack:** Astro, TypeScript strict mode, Astro content collections, CSS, Vitest, Astro Container API, Playwright, `@astrojs/sitemap`

---

## 파일 구조

```text
astro.config.mjs                 # 정적 빌드, 사이트 URL, sitemap 설정
package.json                     # 실행·검증 명령
playwright.config.ts             # 프로덕션 프리뷰 E2E 설정
vitest.config.ts                 # Astro 기반 단위·컴포넌트 테스트 설정
src/pages/robots.txt.ts          # 중앙 사이트 URL 기반 robots와 sitemap 안내
src/content.config.ts            # 원고 frontmatter 스키마
src/content/articles/*.md        # 교체 가능한 임시 원고
src/data/site.ts                 # 브랜드·연락처·외부 링크·고지 중앙 설정
src/lib/content.ts               # 주제 매핑과 글 정렬·선택 함수
src/styles/global.css            # 감정 아카이브 토큰과 반응형 스타일
public/og-default.svg            # 원고별 이미지가 없을 때 쓰는 기본 공유 이미지
src/layouts/BaseLayout.astro     # 공통 head, canonical, OG, JSON-LD, 셸
src/components/Header.astro      # 데스크톱·모바일 내비게이션
src/components/Footer.astro      # 운영 정보와 고지
src/components/ArticleList.astro # 글 목록 표현
src/components/ConsultationCTA.astro # 맥락형 상담 연결
src/pages/index.astro            # 메인 편집 화면
src/pages/topics/[category].astro # 주제별 정적 목록
src/pages/articles/[id].astro    # 글 상세 정적 페이지
src/pages/counseling.astro       # 상담 안내
src/pages/404.astro              # 없는 경로 안내
tests/*.test.ts                  # 데이터·컴포넌트 단위 테스트
tests/e2e/*.spec.ts              # 페이지·SEO·반응형 E2E
```

## Task 1: Astro 기반과 검증 도구 준비

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: 프로젝트 매니페스트 작성**

```json
{
  "name": "emotion-archive",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "verify": "npm run test && npm run build && npm run test:e2e"
  }
}
```

- [ ] **Step 2: 의존성 설치**

Run:

```powershell
npm install astro@latest @astrojs/sitemap@latest
npm install --save-dev @astrojs/check@latest typescript@latest vitest@latest @playwright/test@latest
npx playwright install chromium
```

Expected: `package-lock.json` 생성, 모든 명령 exit 0.

- [ ] **Step 3: Astro와 TypeScript 설정 작성**

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://www.example.invalid',
  output: 'static',
  integrations: [sitemap()],
});
```

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

```ts
// vitest.config.ts
/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: 'http://127.0.0.1:4321' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
```

```gitignore
# .gitignore
node_modules/
dist/
.astro/
playwright-report/
test-results/
.superpowers/
.codex-fable5/
```

- [ ] **Step 4: 빈 기반 빌드가 실패하는지 확인**

Run: `npm run build`

Expected: FAIL. `src/pages` 또는 Astro 프로젝트 소스가 아직 없음.

- [ ] **Step 5: 최소 페이지 생성 후 기반 검증**

```astro
---
// src/pages/index.astro
---
<h1>마음의 장면들</h1>
```

Run: `npm run build`

Expected: PASS, `dist/index.html` 생성.

- [ ] **Step 6: 커밋**

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts .gitignore src/pages/index.astro
git commit -m "build: scaffold Astro site"
```

## Task 2: 중앙 설정과 콘텐츠 스키마

**Files:**
- Create: `src/data/site.ts`
- Create: `src/content.config.ts`
- Create: `src/lib/content.ts`
- Create: `tests/content.test.ts`

- [ ] **Step 1: 콘텐츠 규칙 실패 테스트 작성**

```ts
// tests/content.test.ts
import { describe, expect, it } from 'vitest';
import { categoryMeta, sortNewestFirst } from '@/lib/content';

describe('content helpers', () => {
  it('maps every category to a stable route and Korean label', () => {
    expect(categoryMeta.work).toEqual({ label: '일', route: '/topics/work' });
    expect(categoryMeta.relationships.route).toBe('/topics/relationships');
    expect(categoryMeta.family.route).toBe('/topics/family');
    expect(categoryMeta.notes.route).toBe('/topics/notes');
  });

  it('sorts articles newest first without mutating input', () => {
    const input = [
      { data: { publishedAt: new Date('2026-01-01') } },
      { data: { publishedAt: new Date('2026-02-01') } },
    ];
    expect(sortNewestFirst(input)[0].data.publishedAt.toISOString()).toContain('2026-02-01');
    expect(input[0].data.publishedAt.toISOString()).toContain('2026-01-01');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/content.test.ts`

Expected: FAIL with `Cannot find module '@/lib/content'`.

- [ ] **Step 3: 사이트 설정과 콘텐츠 스키마 구현**

```ts
// src/data/site.ts
export const site = {
  name: '마음의 장면들',
  conceptName: '감정 아카이브',
  description: '일, 관계, 가족 안에서 반복되는 마음의 장면을 이해하기 쉽게 기록합니다.',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://www.example.invalid',
  operator: '독립 심리 콘텐츠 브랜드',
  phone: '',
  kakaoUrl: '',
  bookingUrl: '',
  mapUrl: '',
  notice: '이 사이트의 글은 심리 정보를 제공하며 의료 진단이나 응급 개입을 대체하지 않습니다.',
} as const;
```

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    category: z.enum(['work', 'relationships', 'family', 'notes']),
    title: z.string().min(1),
    summary: z.string().min(1),
    readingTime: z.string().min(1),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    temporary: z.boolean().default(false),
    relatedSlugs: z.array(z.string()).default([]),
    seoTitle: z.string().min(1),
    seoDescription: z.string().min(1),
    shareImage: z.string().optional(),
  }),
});

export const collections = { articles };
```

```ts
// src/lib/content.ts
export const categoryMeta = {
  work: { label: '일', route: '/topics/work' },
  relationships: { label: '관계', route: '/topics/relationships' },
  family: { label: '가족', route: '/topics/family' },
  notes: { label: '마음 기록', route: '/topics/notes' },
} as const;

export type Category = keyof typeof categoryMeta;

type DatedEntry = { data: { publishedAt: Date } };

export function sortNewestFirst<T extends DatedEntry>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}
```

- [ ] **Step 4: 테스트와 타입 검사 통과 확인**

Run:

```powershell
npm test -- tests/content.test.ts
npx astro check
```

Expected: 2 tests PASS, Astro check 0 errors.

- [ ] **Step 5: 커밋**

```powershell
git add src/data/site.ts src/content.config.ts src/lib/content.ts tests/content.test.ts
git commit -m "feat(content): define article model"
```

## Task 3: 디자인 토큰과 공통 레이아웃

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `public/og-default.svg`
- Create: `tests/base-layout.test.ts`

- [ ] **Step 1: 메타데이터 렌더링 실패 테스트 작성**

```ts
// tests/base-layout.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '@/layouts/BaseLayout.astro';

describe('BaseLayout', () => {
  it('renders Korean language, canonical and description metadata', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BaseLayout, {
      props: { title: '테스트 글', description: '테스트 설명', pathname: '/articles/test' },
      slots: { default: '<main><h1>본문</h1></main>' },
    });
    expect(html).toContain('lang="ko"');
    expect(html).toContain('name="description" content="테스트 설명"');
    expect(html).toContain('https://www.example.invalid/articles/test');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/base-layout.test.ts`

Expected: FAIL with missing `BaseLayout.astro`.

- [ ] **Step 3: 공통 레이아웃 구현**

```astro
---
// src/layouts/BaseLayout.astro
import '@/styles/global.css';
import { site } from '@/data/site';

interface Props {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
}

const { title, description, pathname, image = '/og-default.svg', jsonLd } = Astro.props;
const canonical = new URL(pathname, site.url);
const pageTitle = title === site.name ? title : `${title} | ${site.name}`;
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{pageTitle}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={new URL(image, site.url)} />
    {jsonLd && <script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />}
  </head>
  <body><slot /></body>
</html>
```

- [ ] **Step 4: 감정 아카이브 전역 스타일 구현**

```css
/* src/styles/global.css */
:root {
  --canvas: #f4f0e6;
  --surface: #fffdf7;
  --ink: #173629;
  --body: #39443d;
  --muted: #6f746f;
  --accent: #ad5d46;
  --line: #d9d1c1;
  --dark: #14261d;
  --max: 1200px;
  --section: clamp(72px, 10vw, 128px);
  font-family: Inter, Pretendard, "Noto Sans KR", sans-serif;
  color: var(--ink);
  background: var(--canvas);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; color: var(--body); background: var(--canvas); }
a { color: inherit; text-decoration: none; }
button, a { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
img { display: block; max-width: 100%; }
h1, h2, h3 { margin: 0; color: var(--ink); font-weight: 600; letter-spacing: -.045em; }
p { line-height: 1.75; }
.container { width: min(calc(100% - 40px), var(--max)); margin-inline: auto; }
.eyebrow { color: var(--accent); font-size: .75rem; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: 0 18px; border: 1px solid var(--ink); }
.button--primary { color: var(--surface); background: var(--ink); }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation: none !important; transition: none !important; } }
@media (max-width: 767px) { .container { width: min(calc(100% - 32px), var(--max)); } }
```

- [ ] **Step 5: 기본 공유 이미지 구현**

```svg
<!-- public/og-default.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">마음의 장면들</title>
  <desc id="desc">감정 아카이브 기본 공유 이미지</desc>
  <rect width="1200" height="630" fill="#f4f0e6"/>
  <path d="M80 80H1120M80 550H1120" stroke="#d9d1c1"/>
  <text x="80" y="170" fill="#ad5d46" font-family="sans-serif" font-size="24" letter-spacing="5">PSYCHOLOGY ARCHIVE</text>
  <text x="80" y="330" fill="#173629" font-family="sans-serif" font-size="92" font-weight="600">마음의 장면들</text>
  <text x="80" y="410" fill="#39443d" font-family="sans-serif" font-size="34">일, 관계, 가족 안에서 마음을 읽는 기준</text>
</svg>
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npm test -- tests/base-layout.test.ts`

Expected: 1 test PASS.

- [ ] **Step 7: 커밋**

```powershell
git add src/layouts/BaseLayout.astro src/styles/global.css public/og-default.svg tests/base-layout.test.ts
git commit -m "feat(ui): add editorial design foundation"
```

## Task 4: 공통 내비게이션과 상담 연결

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Create: `src/components/ConsultationCTA.astro`
- Create: `tests/navigation.test.ts`

- [ ] **Step 1: 공통 탐색 실패 테스트 작성**

```ts
// tests/navigation.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Header from '@/components/Header.astro';
import ConsultationCTA from '@/components/ConsultationCTA.astro';

describe('shared navigation', () => {
  it('exposes topic and counseling routes', async () => {
    const container = await AstroContainer.create();
    const header = await container.renderToString(Header);
    const cta = await container.renderToString(ConsultationCTA);
    expect(header).toContain('/topics/work');
    expect(header).toContain('/topics/relationships');
    expect(header).toContain('/topics/family');
    expect(cta).toContain('/counseling');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm test -- tests/navigation.test.ts`

Expected: FAIL with missing component imports.

- [ ] **Step 3: Header 구현**

```astro
---
// src/components/Header.astro
import { site } from '@/data/site';
import { categoryMeta } from '@/lib/content';
const links = Object.values(categoryMeta);
---
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__brand" href="/">{site.name}</a>
    <nav class="site-header__desktop" aria-label="주요 메뉴">
      {links.map((link) => <a href={link.route}>{link.label}</a>)}
      <a href="/counseling">상담 안내</a>
    </nav>
    <details class="site-header__mobile">
      <summary>메뉴</summary>
      <nav aria-label="모바일 주요 메뉴">
        {links.map((link) => <a href={link.route}>{link.label}</a>)}
        <a href="/counseling">상담 안내</a>
      </nav>
    </details>
  </div>
</header>
<style>
  .site-header { border-bottom: 1px solid var(--line); }
  .site-header__inner { display: flex; min-height: 68px; align-items: center; justify-content: space-between; }
  .site-header__brand { font-weight: 700; color: var(--ink); }
  .site-header__desktop { display: flex; gap: 24px; }
  .site-header__mobile { display: none; }
  summary { cursor: pointer; min-height: 44px; display: flex; align-items: center; }
  nav { display: flex; gap: 24px; }
  @media (max-width: 767px) { .site-header__desktop { display: none; } .site-header__mobile { display: block; } .site-header__mobile nav { position: absolute; right: 16px; z-index: 10; flex-direction: column; padding: 20px; background: var(--surface); border: 1px solid var(--line); } }
</style>
```

- [ ] **Step 4: Footer와 상담 CTA 구현**

```astro
---
// src/components/ConsultationCTA.astro
---
<section class="consultation-cta" aria-labelledby="consultation-title">
  <span class="eyebrow">Counseling</span>
  <h2 id="consultation-title">더 읽는 것만으로 정리되지 않을 때</h2>
  <p>현재 상황을 함께 살펴보고 다음 선택을 정리할 수 있습니다.</p>
  <a class="button button--primary" href="/counseling">상담 안내 보기</a>
</section>
```

```astro
---
// src/components/Footer.astro
import { site } from '@/data/site';
---
<footer class="site-footer">
  <div class="container">
    <strong>{site.name}</strong>
    <p>{site.operator}</p>
    <p>{site.notice}</p>
    <a href="/counseling">상담 안내</a>
  </div>
</footer>
<style>
  .site-footer { padding: 64px 0; color: #dfe7e1; background: var(--dark); }
  .site-footer p { max-width: 720px; color: #b9c4bc; }
</style>
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `npm test -- tests/navigation.test.ts`

Expected: 1 test PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/components/Header.astro src/components/Footer.astro src/components/ConsultationCTA.astro tests/navigation.test.ts
git commit -m "feat(ui): add site navigation"
```

## Task 5: 임시 원고와 메인페이지

**Files:**
- Create: `src/content/articles/work-boundary.md`
- Create: `src/content/articles/relationship-distance.md`
- Create: `src/content/articles/family-conversation.md`
- Create: `src/components/ArticleList.astro`
- Modify: `src/pages/index.astro`
- Create: `tests/e2e/home.spec.ts`

- [ ] **Step 1: 메인페이지 E2E 실패 테스트 작성**

```ts
// tests/e2e/home.spec.ts
import { expect, test } from '@playwright/test';

test('home presents content before counseling', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('마음을 읽는 기준');
  await expect(page.getByRole('link', { name: '글 둘러보기' })).toBeVisible();
  const firstArticle = page.locator('main article').first();
  const counseling = page.getByRole('heading', { name: '더 읽는 것만으로 정리되지 않을 때' });
  expect(await firstArticle.evaluate((el) => el.compareDocumentPosition(document.querySelector('#consultation-title')!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect(counseling).toBeVisible();
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run build; npm run test:e2e -- tests/e2e/home.spec.ts`

Expected: FAIL because the current minimal page has no required sections.

- [ ] **Step 3: 스키마에 맞는 임시 원고 3개 작성**

```markdown
<!-- src/content/articles/work-boundary.md -->
---
category: work
title: 일이 끝난 뒤에도 마음이 퇴근하지 못할 때
summary: 업무 긴장이 일상으로 이어지는 장면을 살펴봅니다.
readingTime: 6분 읽기
publishedAt: 2026-08-24
featured: true
temporary: true
relatedSlugs: []
seoTitle: 일이 끝난 뒤에도 마음이 퇴근하지 못할 때
seoDescription: 업무 긴장과 회복의 경계를 이해하기 위한 임시 콘텐츠입니다.
---

이 글은 레이아웃 검증을 위한 임시 원고입니다. 최종 원고가 제공되면 같은 파일 구조로 교체합니다.
```

```markdown
<!-- src/content/articles/relationship-distance.md -->
---
category: relationships
title: 가까운 사이에서 마음의 거리가 생길 때
summary: 관계의 거리감이 커지는 반복 장면을 살펴봅니다.
readingTime: 6분 읽기
publishedAt: 2026-08-23
featured: false
temporary: true
relatedSlugs: []
seoTitle: 가까운 사이에서 마음의 거리가 생길 때
seoDescription: 관계의 거리와 회복을 이해하기 위한 임시 콘텐츠입니다.
---

이 글은 레이아웃 검증을 위한 임시 원고입니다. 최종 원고가 제공되면 같은 파일 구조로 교체합니다.
```

```markdown
<!-- src/content/articles/family-conversation.md -->
---
category: family
title: 가족의 대화가 같은 자리로 돌아올 때
summary: 가족 안에서 반복되는 대화와 감정의 경로를 살펴봅니다.
readingTime: 7분 읽기
publishedAt: 2026-08-22
featured: false
temporary: true
relatedSlugs: []
seoTitle: 가족의 대화가 같은 자리로 돌아올 때
seoDescription: 가족의 대화와 성장을 이해하기 위한 임시 콘텐츠입니다.
---

이 글은 레이아웃 검증을 위한 임시 원고입니다. 최종 원고가 제공되면 같은 파일 구조로 교체합니다.
```

- [ ] **Step 4: 글 목록 컴포넌트 구현**

```astro
---
// src/components/ArticleList.astro
import { categoryMeta } from '@/lib/content';
const { articles } = Astro.props;
---
<div class="article-list">
  {articles.map((article) => (
    <article>
      <span>{categoryMeta[article.data.category].label}</span>
      <h3><a href={`/articles/${article.id}`}>{article.data.title}</a></h3>
      <p>{article.data.summary}</p>
      <small>{article.data.readingTime}</small>
    </article>
  ))}
</div>
<style>
  .article-list article { display: grid; grid-template-columns: 100px 1fr auto; gap: 24px; padding: 28px 0; border-top: 1px solid var(--line); }
  .article-list h3, .article-list p { margin: 0; }
  @media (max-width: 767px) { .article-list article { grid-template-columns: 1fr; gap: 8px; } }
</style>
```

- [ ] **Step 5: 메인페이지 구현**

```astro
---
// src/pages/index.astro
import { getCollection } from 'astro:content';
import ArticleList from '@/components/ArticleList.astro';
import ConsultationCTA from '@/components/ConsultationCTA.astro';
import Footer from '@/components/Footer.astro';
import Header from '@/components/Header.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { categoryMeta, sortNewestFirst } from '@/lib/content';
import { site } from '@/data/site';

const articles = sortNewestFirst(await getCollection('articles'));
const featured = articles.find((article) => article.data.featured) ?? articles[0];
const topics = Object.entries(categoryMeta).filter(([key]) => key !== 'notes');
---
<BaseLayout title={site.name} description={site.description} pathname="/">
  <Header />
  <main>
    <section class="hero container">
      <div><span class="eyebrow">Psychology archive · Seoul</span><h1>삶이 흔들릴 때,<br />마음을 읽는 기준</h1><p>{site.description}</p><a class="button button--primary" href="#latest">글 둘러보기</a></div>
      <aside><strong>이번 주의 색인</strong>{articles.slice(0, 3).map((article, index) => <a href={`/articles/${article.id}`}><span>0{index + 1}</span>{article.data.title}</a>)}</aside>
    </section>
    <section class="container topics"><span class="eyebrow">Life index</span><h2>삶의 영역</h2><div>{topics.map(([key, meta], index) => <a href={meta.route}><span>0{index + 1}</span><h3>{key === 'work' ? '일과 번아웃' : key === 'relationships' ? '관계와 회복' : '가족과 성장'}</h3><p>{meta.label}에 반복되는 마음의 장면을 읽습니다.</p></a>)}</div></section>
    {featured && <section class="container featured"><span class="eyebrow">Editor's selection</span><h2><a href={`/articles/${featured.id}`}>{featured.data.title}</a></h2><p>{featured.data.summary}</p></section>}
    <section class="container" id="latest"><span class="eyebrow">Latest archive</span><h2>최신 기록</h2><ArticleList articles={articles} /></section>
    <blockquote class="container">마음을 이해하는 일은 정답을 찾는 일이 아니라, 반복되는 장면에 이름을 붙이는 일입니다.</blockquote>
    <div class="container"><ConsultationCTA /></div>
  </main>
  <Footer />
</BaseLayout>
<style>
  main > section, main > div, blockquote { padding-block: var(--section); }
  .hero { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(280px, .6fr); gap: 64px; }
  .hero h1 { margin: 18px 0; font-size: clamp(3rem, 7vw, 6rem); line-height: .98; }
  .hero aside { align-self: end; padding: 28px; background: var(--surface); border: 1px solid var(--line); }
  .hero aside a { display: grid; grid-template-columns: 34px 1fr; gap: 10px; padding: 16px 0; border-top: 1px solid var(--line); }
  .topics > div { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin-top: 32px; border-top: 1px solid var(--line); }
  .topics a { padding: 30px 24px; border-right: 1px solid var(--line); }
  .featured { background: var(--surface); }
  blockquote { color: var(--ink); font-size: clamp(1.6rem, 4vw, 3rem); line-height: 1.4; }
  @media (max-width: 767px) { .hero, .topics > div { grid-template-columns: 1fr; } .hero { gap: 28px; } .topics a { border-right: 0; border-bottom: 1px solid var(--line); } }
</style>
```

- [ ] **Step 6: 빌드와 E2E 통과 확인**

Run:

```powershell
npm run build
npm run test:e2e -- tests/e2e/home.spec.ts
```

Expected: build PASS, desktop/mobile 각각 1 test PASS.

- [ ] **Step 7: 커밋**

```powershell
git add src/content/articles src/components/ArticleList.astro src/pages/index.astro tests/e2e/home.spec.ts
git commit -m "feat(home): build editorial landing page"
```

## Task 6: 주제와 글 상세 페이지

**Files:**
- Create: `src/pages/topics/[category].astro`
- Create: `src/pages/articles/[id].astro`
- Create: `tests/e2e/content.spec.ts`

- [ ] **Step 1: 정적 콘텐츠 경로 실패 테스트 작성**

```ts
// tests/e2e/content.spec.ts
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
  expect(JSON.parse(jsonLd!)['@type']).toBe('Article');
  await expect(page.getByRole('link', { name: '상담 안내 보기' })).toBeVisible();
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run build; npm run test:e2e -- tests/e2e/content.spec.ts`

Expected: FAIL with missing generated routes.

- [ ] **Step 3: 주제별 정적 경로 구현**

```astro
---
// src/pages/topics/[category].astro
import { getCollection } from 'astro:content';
import ArticleList from '@/components/ArticleList.astro';
import ConsultationCTA from '@/components/ConsultationCTA.astro';
import Footer from '@/components/Footer.astro';
import Header from '@/components/Header.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { categoryMeta, sortNewestFirst, type Category } from '@/lib/content';

export function getStaticPaths() {
  return Object.keys(categoryMeta).map((category) => ({ params: { category }, props: { category: category as Category } }));
}

const { category } = Astro.props;
const meta = categoryMeta[category];
const articles = sortNewestFirst((await getCollection('articles')).filter((article) => article.data.category === category));
---
<BaseLayout title={meta.label} description={`${meta.label}에 반복되는 마음의 장면을 읽습니다.`} pathname={meta.route}>
  <Header />
  <main class="container">
    <section><span class="eyebrow">Topic archive</span><h1>{meta.label}</h1><p>{meta.label}에 반복되는 마음의 장면을 읽습니다.</p></section>
    {articles.length ? <ArticleList articles={articles} /> : <p>아직 준비된 글이 없습니다.</p>}
    <ConsultationCTA />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 4: 글 상세 정적 경로와 JSON-LD 구현**

```astro
---
// src/pages/articles/[id].astro
import { getCollection, render, type CollectionEntry } from 'astro:content';
import ArticleList from '@/components/ArticleList.astro';
import ConsultationCTA from '@/components/ConsultationCTA.astro';
import Footer from '@/components/Footer.astro';
import Header from '@/components/Header.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { categoryMeta } from '@/lib/content';
import { site } from '@/data/site';

export async function getStaticPaths() {
  return (await getCollection('articles')).map((entry) => ({ params: { id: entry.id }, props: { entry } }));
}

const { entry } = Astro.props as { entry: CollectionEntry<'articles'> };
const { Content } = await render(entry);
const allArticles = await getCollection('articles');
const related = entry.data.relatedSlugs.map((id) => allArticles.find((article) => article.id === id)).filter((article): article is CollectionEntry<'articles'> => Boolean(article));
const pathname = `/articles/${entry.id}`;
const jsonLd = { '@context': 'https://schema.org', '@type': 'Article', headline: entry.data.title, description: entry.data.summary, datePublished: entry.data.publishedAt.toISOString(), mainEntityOfPage: new URL(pathname, site.url).href };
---
<BaseLayout title={entry.data.seoTitle} description={entry.data.seoDescription} pathname={pathname} image={entry.data.shareImage} jsonLd={jsonLd}>
  <Header />
  <main class="container article-page">
    <header><a href={categoryMeta[entry.data.category].route}>{categoryMeta[entry.data.category].label}</a><h1>{entry.data.title}</h1><p>{entry.data.summary}</p><small>{entry.data.readingTime}</small></header>
    <article class="prose"><Content /></article>
    {related.length > 0 && <section><h2>이어 읽기</h2><ArticleList articles={related} /></section>}
    <ConsultationCTA />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 5: 검증 통과 확인**

Run:

```powershell
npm run build
npm run test:e2e -- tests/e2e/content.spec.ts
```

Expected: build PASS, desktop/mobile 각각 2 tests PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/pages/topics src/pages/articles tests/e2e/content.spec.ts
git commit -m "feat(content): add topic and article routes"
```

## Task 7: 상담 안내, 404, robots와 SEO 완성

**Files:**
- Create: `src/pages/counseling.astro`
- Create: `src/pages/404.astro`
- Create: `src/pages/robots.txt.ts`
- Create: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: 상담·SEO 실패 테스트 작성**

```ts
// tests/e2e/seo.spec.ts
import { expect, test } from '@playwright/test';

test('counseling falls back to on-page contact guidance', async ({ page }) => {
  await page.goto('/counseling');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('상담 안내');
  await expect(page.getByText('연락 채널을 준비하고 있습니다.')).toBeVisible();
});

test('core pages expose canonical metadata', async ({ page }) => {
  for (const path of ['/', '/topics/work', '/articles/work-boundary', '/counseling']) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /example\.invalid/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
  }
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `npm run build; npm run test:e2e -- tests/e2e/seo.spec.ts`

Expected: FAIL because counseling route does not exist.

- [ ] **Step 3: 상담 안내와 안전한 링크 fallback 구현**

```astro
---
// src/pages/counseling.astro
import Footer from '@/components/Footer.astro';
import Header from '@/components/Header.astro';
import BaseLayout from '@/layouts/BaseLayout.astro';
import { site } from '@/data/site';

const channels = [
  site.kakaoUrl && { label: '카카오톡 상담', href: site.kakaoUrl },
  site.bookingUrl && { label: '상담 예약', href: site.bookingUrl },
].filter((channel): channel is { label: string; href: string } => Boolean(channel));
---
<BaseLayout title="상담 안내" description="읽기만으로 정리되지 않는 마음을 함께 살펴보는 상담 안내입니다." pathname="/counseling">
  <Header />
  <main class="container counseling-page">
    <header><span class="eyebrow">Counseling</span><h1>상담 안내</h1><p>혼자 정리하기 어려운 문제라면 현재 상황과 다음 선택을 함께 살펴볼 수 있습니다.</p></header>
    <section><h2>이런 순간에 도움이 될 수 있습니다</h2><ul><li>일의 긴장이 일상과 수면까지 이어질 때</li><li>관계 갈등이 같은 방식으로 반복될 때</li><li>가족 안에서 감정과 역할의 부담이 커질 때</li></ul></section>
    <section><h2>진행 방식</h2><p>연락 채널에서 현재 고민과 가능한 시간을 남기면 운영자가 상담 절차를 안내합니다.</p>{channels.length > 0 ? <div>{channels.map((channel) => <a class="button button--primary" href={channel.href}>{channel.label}</a>)}</div> : <p>연락 채널을 준비하고 있습니다.</p>}</section>
    <section><h2>운영 안내</h2><p>{site.operator}</p>{site.phone && <p>{site.phone}</p>}<p>{site.notice}</p></section>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 4: 404와 robots 구현**

```astro
---
// src/pages/404.astro
import BaseLayout from '@/layouts/BaseLayout.astro';
import Header from '@/components/Header.astro';
import Footer from '@/components/Footer.astro';
---
<BaseLayout title="페이지를 찾을 수 없습니다" description="요청한 페이지가 없거나 이동했습니다." pathname="/404">
  <Header />
  <main class="container">
    <p class="eyebrow">404</p>
    <h1>페이지를 찾을 수 없습니다</h1>
    <p>주소를 확인하거나 감정 아카이브의 최신 글로 돌아가세요.</p>
    <a class="button button--primary" href="/">홈으로 돌아가기</a>
  </main>
  <Footer />
</BaseLayout>
```

```ts
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';
import { site } from '@/data/site';

export const GET: APIRoute = () => new Response(
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap-index.xml\n`,
  { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
```

- [ ] **Step 5: sitemap과 E2E 검증**

Run:

```powershell
npm run build
Test-Path dist/sitemap-index.xml
npm run test:e2e -- tests/e2e/seo.spec.ts
```

Expected: build PASS, sitemap path `True`, desktop/mobile 각각 2 tests PASS.

- [ ] **Step 6: 커밋**

```powershell
git add src/pages/counseling.astro src/pages/404.astro src/pages/robots.txt.ts tests/e2e/seo.spec.ts
git commit -m "feat(seo): add counseling and crawl metadata"
```

## Task 8: 반응형·접근성·최종 검증

**Files:**
- Modify: `src/styles/global.css`
- Modify: `tests/e2e/home.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`

- [ ] **Step 1: 가로 넘침과 키보드 탐색 실패 테스트 작성**

```ts
// tests/e2e/responsive.spec.ts
import { expect, test } from '@playwright/test';

for (const path of ['/', '/topics/work', '/articles/work-boundary', '/counseling', '/404']) {
  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);
    const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(sizes.document).toBeLessThanOrEqual(sizes.viewport);
  });
}

test('primary navigation is keyboard reachable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
```

- [ ] **Step 2: 현재 상태 확인**

Run: `npm run build; npm run test:e2e -- tests/e2e/responsive.spec.ts`

Expected: 결과를 기록한다. 하나라도 실패하면 해당 경로와 viewport 폭을 수정 대상으로 사용한다.

- [ ] **Step 3: 320px·768px·1200px 레이아웃 보정**

```css
/* src/styles/global.css에 추가 */
h1, h2, h3, p, a { overflow-wrap: anywhere; }
.prose { width: min(100%, 68ch); margin-inline: auto; }
.prose img { width: 100%; height: auto; }
.consultation-cta { margin-block: var(--section); padding: clamp(28px, 6vw, 56px); background: var(--surface); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.article-page > header, .counseling-page > header { padding-block: var(--section); }
.article-page > header h1, .counseling-page > header h1 { max-width: 16ch; margin-block: 18px; font-size: clamp(2.6rem, 7vw, 5.5rem); line-height: 1.04; }
.article-page > section, .counseling-page > section { padding-block: clamp(44px, 8vw, 88px); border-top: 1px solid var(--line); }
@media (max-width: 767px) {
  :root { --section: 64px; }
  .button, summary, nav a { min-height: 44px; }
}
```

- [ ] **Step 4: 전체 자동 검증**

Run:

```powershell
npm run test
npm run build
npm run test:e2e
```

Expected: Vitest all PASS, Astro check 0 errors, build PASS, Playwright desktop/mobile all PASS.

- [ ] **Step 5: 브라우저 시각 검증**

메인, 주제, 글 상세, 상담, 404를 320px, 768px, 1200px에서 확인한다. 검증 항목은 가로 넘침, 제목 겹침, 메뉴 접근, 본문 줄 길이, 상담 CTA 순서, 다크 푸터 마감이다. 발견한 문제는 해당 컴포넌트나 `global.css`에서 수정한 뒤 Step 4를 다시 실행한다.

- [ ] **Step 6: 임시 콘텐츠 표시 확인**

Run: `rg -n "temporary: true|임시 원고" src/content/articles`

Expected: 임시 글 3개가 모두 검색되며 최종 원고 교체 위치가 명확하다.

- [ ] **Step 7: 최종 커밋**

```powershell
git add src/styles/global.css tests/e2e
git commit -m "fix(ui): polish responsive layouts"
```

## 완료 조건

- 원고와 브랜드 정보가 중앙 데이터에서 교체 가능하다.
- 콘텐츠가 상담 CTA보다 먼저 등장한다.
- 메인, 네 주제, 글 상세, 상담 안내, 404가 정적으로 생성된다.
- canonical, Open Graph, Article JSON-LD, sitemap, robots가 생성된다.
- 320px, 768px, 1200px에서 화면이 겹치거나 가로로 넘치지 않는다.
- Vitest, Astro check, build, Playwright가 모두 통과한다.
