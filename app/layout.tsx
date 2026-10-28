import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "나의 성향 아키타입 테스트", template: "%s · 나의 성향 아키타입 테스트" },
  description: "성격심리학 연구(HEXACO·Big Five)를 참고한 42문항 자기이해 테스트. 6가지 성향으로 24가지 아키타입 중 나와 가장 가까운 유형을 찾아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5f2",
};

const DISCLAIMER = "이 테스트는 성격심리학 연구를 참고한 자기이해용 테스트이며, 임상적 진단이나 평가를 대신하지 않습니다.";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4">
          <header className="flex items-center justify-between py-4">
            <Link href="/" className="font-extrabold tracking-tight text-slate-900">
              성향 아키타입
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-slate-500">
              <Link href="/test/" className="hover:text-slate-900">
                테스트
              </Link>
              <Link href="/types/" className="hover:text-slate-900">
                유형 도감
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs leading-relaxed text-slate-400">
            <p>{DISCLAIMER}</p>
            <p className="mt-1">응답은 내 브라우저에만 저장되며 서버로 전송되지 않습니다.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
