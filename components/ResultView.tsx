"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProfileRadar from "./ProfileRadar";
import DimensionBars from "./DimensionBars";
import ShareCard from "./ShareCard";
import TypeEmblem from "./TypeEmblem";
import { Hashtags, MiniTypeCard, Section, TypeDetails } from "./TypeProfile";
import { itemsPerDimension, types } from "@/lib/data";
import { ink, tint } from "@/lib/profile";
import { resultFromVector, sumsToVector } from "@/lib/scoring";
import { decodeSums, SHARE_PARAM } from "@/lib/share";
import { loadLastResult } from "@/lib/storage";

export default function ResultView() {
  const params = useSearchParams();
  const code = params.get(SHARE_PARAM);
  const result = useMemo(() => {
    const sums = decodeSums(code, itemsPerDimension);
    return sums ? resultFromVector(sumsToVector(sums, itemsPerDimension), types) : null;
  }, [code]);

  const [isMine, setIsMine] = useState<boolean | null>(null);
  useEffect(() => setIsMine(code !== null && loadLastResult() === code?.toLowerCase()), [code]);

  if (!result || !code) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold text-slate-800">결과를 찾을 수 없어요</p>
        <p className="mt-2 text-slate-500">링크가 잘못되었거나 일부가 잘렸을 수 있어요.</p>
        <Link href="/test/" className="mt-6 inline-block rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white">
          테스트 하러 가기
        </Link>
      </div>
    );
  }

  const { main, hidden, ranking, vector } = result;
  const type = main.type;
  const accent = ink(type.color);

  return (
    <div className="space-y-5 pb-6">
      {/* 헤더 */}
      <section className="rounded-3xl p-6 text-center sm:p-8" style={{ backgroundColor: tint(type.color, 0.12) }}>
        <p className="text-sm font-semibold text-slate-500">{isMine === false ? "공유된 결과" : "나의 성향 아키타입은"}</p>
        <div className="my-5 flex justify-center">
          <TypeEmblem type={type} size="lg" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
          {type.name}
        </h1>
        <p className="mt-2 text-lg text-slate-700">{type.summary}</p>
        <p className="mt-3 inline-block rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600">일치도 {main.match}%</p>
        <div className="mt-5">
          <Hashtags type={type} />
        </div>
      </section>

      <Section title="나의 6가지 성향">
        <ProfileRadar vector={vector} color={type.color} compare={{ vector: type.prototype, label: `${type.name} 기준` }} />
        <div className="mt-6">
          <DimensionBars vector={vector} color={type.color} />
        </div>
        <p className="mt-5 text-xs leading-relaxed text-slate-400">
          가운데는 중간, 양 끝으로 갈수록 그 성향이 뚜렷하다는 뜻이에요. 어느 쪽이 더 좋은 것은 아니에요.
        </p>
      </Section>

      <TypeDetails type={type} />

      <Section title="숨은 닮은꼴">
        <p className="mb-3 text-sm text-slate-500">두 번째로 가까운 유형이에요. 이런 면도 함께 가지고 있어요.</p>
        <MiniTypeCard type={hidden.type} note={`일치도 ${hidden.match}% · ${hidden.type.summary}`} />
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-700">가까운 유형 순위 더 보기</summary>
          <ol className="mt-3 space-y-2">
            {ranking.slice(0, 6).map((r, i) => (
              <li key={r.type.id} className="flex items-center gap-3">
                <span className="w-5 text-right text-slate-400">{i + 1}</span>
                <Link href={`/types/${r.type.id}/`} className="w-36 shrink-0 truncate text-slate-700 hover:underline">
                  {r.type.name}
                </Link>
                <span className="h-2 flex-1 rounded-full bg-slate-100">
                  <span className="block h-full rounded-full" style={{ width: `${r.match}%`, backgroundColor: r.type.color }} />
                </span>
                <span className="w-10 text-right tabular-nums text-slate-500">{r.match}%</span>
              </li>
            ))}
          </ol>
        </details>
      </Section>

      <ShareSection code={code} result={result} />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/test/" className="rounded-2xl bg-slate-900 py-4 text-center font-bold text-white transition hover:bg-slate-700">
          {isMine === false ? "나도 테스트 하기" : "다시 하기"}
        </Link>
        <Link href="/types/" className="rounded-2xl bg-white py-4 text-center font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-400">
          24유형 도감 보기
        </Link>
      </div>
    </div>
  );
}

function ShareSection({ code, result }: { code: string; result: NonNullable<ReturnType<typeof resultFromVector>> }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const type = result.main.type;

  const shareUrl = () => `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/result/?${SHARE_PARAM}=${code}`;

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  };

  const copyLink = async () => {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      flash("링크를 복사했어요");
    } catch {
      window.prompt("아래 링크를 복사하세요", url);
    }
  };

  const nativeShare = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: `나는 ${type.name}`, text: `${type.name} — ${type.summary}`, url });
      } catch {
        // 사용자가 취소
      }
    } else {
      await copyLink();
    }
  };

  const saveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: "#ffffff", cacheBust: true });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `성향아키타입-${type.name.replace(/\s+/g, "")}.png`;
      a.click();
      flash("이미지를 저장했어요");
    } catch {
      flash("이미지 저장에 실패했어요. 화면을 캡처해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="결과 공유하기">
      <ShareCard ref={cardRef} type={type} vector={result.vector} match={result.main.match} hidden={result.hidden.type} />
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button onClick={saveImage} disabled={saving} className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50">
          {saving ? "저장 중…" : "이미지 저장"}
        </button>
        <button onClick={copyLink} className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          링크 복사
        </button>
        <button onClick={nativeShare} className="rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          공유하기
        </button>
      </div>
      <p className="mt-3 min-h-5 text-center text-sm text-slate-500" role="status" aria-live="polite">
        {message}
      </p>
      <p className="text-center text-xs text-slate-400">링크에는 6개 차원 점수만 담기고, 응답 내용이나 개인정보는 포함되지 않아요.</p>
    </Section>
  );
}
