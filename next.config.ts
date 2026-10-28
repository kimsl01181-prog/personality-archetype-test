import type { NextConfig } from "next";

// GitHub Pages처럼 하위 경로(/저장소이름)에 배포할 때 빌드 시 PAGES_BASE_PATH로 넘긴다. 로컬·Vercel에서는 비워 둔다.
const basePath = process.env.PAGES_BASE_PATH ?? "";

// 정적 사이트로 빌드 (out/ 폴더). 서버 없이 정적 호스팅에 배포 가능.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
