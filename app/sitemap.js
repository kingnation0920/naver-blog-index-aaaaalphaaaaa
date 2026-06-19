import { XMLParser } from "fast-xml-parser";

const NAVER_BLOG_ID = "aaaaalphaaaaa";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
const BASE_URL = `https://naver-blog-index-${NAVER_BLOG_ID}.vercel.app`;

async function getPostSlugs() {
  try {
    const res = await fetch(RSS_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    return items
      .map((item) => {
        const link = item.link ?? "#";
        const match = link.match(/\/(\d+)(?:\?|$)/);
        return { slug: match ? match[1] : null, pubDate: item.pubDate ?? "" };
      })
      .filter((p) => p.slug);
  } catch (e) {
    return [];
  }
}

export default async function sitemap() {
  const posts = await getPostSlugs();
  const postUrls = posts.map((p) => ({
    url: `${BASE_URL}/posts/${p.slug}`,
    lastModified: p.pubDate ? new Date(p.pubDate) : new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...postUrls,
  ];
}
