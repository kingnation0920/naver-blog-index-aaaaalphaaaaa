export const metadata = {
  title: "aaaaalphaaaaa 네이버 블로그 글 모음",
  description: "aaaaalphaaaaa 네이버 블로그 최신 글 목록을 자동으로 보여줍니다.",
  verification: {
    google: [
      "DygTh4U9GSwzJ_41exp75QLL3boNvWGo7h80IOdVkY0",
      "RfKH7tYbBbOdyPSJOdtQ6lOWT4A20B2scdMElFbFIcc",
    ],
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
        <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
if(!wcs_add) var wcs_add = {};
wcs_add["wa"] = "1fcedd2e3361650";
if(window.wcs) {
  wcs_do();
}
`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-K3H58YCSBV" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-K3H58YCSBV');
`,
          }}
        />
      </body>
    </html>
  );
}
