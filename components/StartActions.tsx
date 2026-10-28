"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { items } from "@/lib/data";
import { SHARE_PARAM } from "@/lib/share";
import { clearProgress, loadLastResult, loadProgress } from "@/lib/storage";

/** 시작 버튼. 저장된 진행 상태나 지난 결과가 있으면 함께 보여준다. */
export default function StartActions() {
  const router = useRouter();
  const [saved, setSaved] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  useEffect(() => {
    const progress = loadProgress(items.map((i) => i.id));
    setSaved(progress ? Object.keys(progress.answers).length : null);
    setLastResult(loadLastResult());
  }, []);

  const startOver = () => {
    clearProgress();
    router.push("/test/");
  };

  return (
    <div className="space-y-3">
      {saved ? (
        <>
          <Link href="/test/" className="block rounded-2xl bg-slate-900 py-4 text-center text-lg font-bold text-white transition hover:bg-slate-700">
            이어서 하기 ({saved}/{items.length})
          </Link>
          <button onClick={startOver} className="block w-full rounded-2xl bg-white py-4 text-center font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-400">
            처음부터 다시 하기
          </button>
        </>
      ) : (
        <Link href="/test/" className="block rounded-2xl bg-slate-900 py-4 text-center text-lg font-bold text-white transition hover:bg-slate-700">
          테스트 시작하기
        </Link>
      )}
      {lastResult && (
        <Link href={`/result/?${SHARE_PARAM}=${lastResult}`} className="block py-2 text-center text-sm font-medium text-slate-500 underline-offset-2 hover:underline">
          지난 결과 다시 보기
        </Link>
      )}
    </div>
  );
}
