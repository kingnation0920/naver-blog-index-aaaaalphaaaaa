export const metadata = {
  title: "aaaaalphaaaaa 네이버 블로그 글 모음",
  description: "aaaaalphaaaaa 네이버 블로그 최신 글 목록을 자동으로 보여줍니다.",
  verification: {
    google: "DygTh4U9GSwzJ_41exp75QLL3boNvWGo7h80IOdVkY0",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
          background: "#f7f7f8",
          color: "#222",
        }}
      >
        {children}
      </body>
    </html>
  );
}
