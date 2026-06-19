import { XMLParser } from "fast-xml-parser";

const NAVER_BLOG_ID = "aaaaalphaaaaa";
const RSS_URL = `https://rss.blog.naver.com/${NAVER_BLOG_ID}.xml`;
export const revalidate = 3600;

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function getPostSlug(link = "") {
  const match = link.match(/\/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
}

async function getPosts() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RSSReader/1.0)" },
    });
    if (!res.ok) return { posts: [], error: `RSS ìëµ ì¤ë¥ (status ${res.status})` };
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const data = parser.parse(xml);
    let items = data?.rss?.channel?.item ?? [];
    if (!Array.isArray(items)) items = [items];
    const posts = items.map((item) => {
      const link = item.link ?? "#";
      const slug = getPostSlug(link);
      return {
        title: typeof item.title === "string" ? item.title : item.title?.["#text"] ?? "(ì ëª© ìì)",
        link,
        slug,
        description: stripHtml(typeof item.description === "string" ? item.description : item.description?.["#text"] ?? "").slice(0, 160),
        pubDate: item.pubDate ?? "",
      };
    });
    return { posts, error: null };
  } catch (e) {
    return { posts: [], error: String(e) };
  }
}

export default async function Home() {
  const { posts, error } = await getPosts();
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>{NAVER_BLOG_ID} ë¤ì´ë² ë¸ë¡ê·¸ ê¸ ëª¨ì</h1>
        <p style={{ color: "#666", lineHeight: 1.6 }}>
          ë¤ì´ë² ë¸ë¡ê·¸{" "}
          <a href={`https://m.blog.naver.com/${NAVER_BLOG_ID}`} target="_blank" rel="noopener noreferrer">
            m.blog.naver.com/{NAVER_BLOG_ID}
          </a>{" "}
          ì ìµì  ê¸ ëª©ë¡ìëë¤. (RSS ê¸°ë°, 60ë¶ë§ë¤ ìë ê°±ì )
        </p>
      </header>
      {error && <p style={{ color: "#c00" }}>ê¸ ëª©ë¡ì ë¶ë¬ì¤ë ì¤ ì¤ë¥ê° ë°ìíìµëë¤: {error}</p>}
      {!error && posts.length === 0 && <p style={{ color: "#666" }}>íìí  ê¸ì´ ììµëë¤.</p>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {posts.map((post) => (
          <li key={post.link} style={{ background: "#fff", border: "1px solid #e5e5e8", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
            <a href={post.slug ? `/posts/${post.slug}` : post.link} style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a", textDecoration: "none" }}>
              {post.title}
            </a>
            {post.description && <p style={{ margin: "8px 0 0", color: "#555", fontSize: 14, lineHeight: 1.6 }}>{post.description}</p>}
            {post.pubDate && <time style={{ display: "block", marginTop: 8, fontSize: 12, color: "#999" }}>{post.pubDate}</time>}
          </li>
        ))}
      </ul>
    </main>
  );
}
