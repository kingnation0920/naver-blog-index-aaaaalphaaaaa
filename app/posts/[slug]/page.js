import { XMLParser } from "fast-xml-parser";
import { notFound } from "next/navigation";

const NAVER_BLOG_ID = "aaaaalphaaaaa";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
export const revalidate = 3600;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

async function getAllPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    return items.map((item) => {
      const link = item.link ?? "#";
      const match = link.match(/\/(\d+)(?:\?|$)/);
      const slug = match ? match[1] : null;
      return {
        title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(제목 없음)",
        link,
        slug,
        content: typeof item.description === "string" ? item.description : item.description?.["#text"] ?? "",
        pubDate: item.pubDate ?? "",
      };
    });
  } catch (e) {
    return [];
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };
  return {
    title: post.title,
    description: stripHtml(post.content).slice(0, 160),
  };
}

export default async function PostPage({ params }) {
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <nav style={{ marginBottom: 24 }}>
        <a href="/" style={{ color: "#666", textDecoration: "none", fontSize: 14 }}>
          ← 목록으로
        </a>
      </nav>
      <article>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12, lineHeight: 1.4 }}>{post.title}</h1>
        {post.pubDate && (
          <time style={{ display: "block", marginBottom: 24, fontSize: 13, color: "#999" }}>{post.pubDate}</time>
        )}
        <div
          style={{ lineHeight: 1.8, color: "#333", fontSize: 16 }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #eee" }}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#03c75a", textDecoration: "none", fontSize: 14 }}
          >
            네이버 블로그 원문 보기 →
          </a>
        </div>
      </article>
    </main>
  );
}
