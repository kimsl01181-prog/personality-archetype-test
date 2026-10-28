import { Suspense } from "react";
import type { Metadata } from "next";
import ResultView from "@/components/ResultView";

export const metadata: Metadata = { title: "결과" };

// 정적 빌드에서 쿼리 파라미터(?r=)는 브라우저에서 읽으므로 Suspense로 감싼다.
export default function ResultPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-400">결과를 불러오는 중…</div>}>
      <ResultView />
    </Suspense>
  );
}
