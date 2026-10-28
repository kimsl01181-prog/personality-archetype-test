"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { items, itemsPerDimension } from "@/lib/data";
import { computeRawSums } from "@/lib/scoring";
import { encodeSums, SHARE_PARAM } from "@/lib/share";
import { clearProgress, loadProgress, saveLastResult, saveProgress } from "@/lib/storage";
import type { Answers } from "@/lib/types";

const LIKERT = [
  { value: 1, label: "전혀 아니다" },
  { value: 2, label: "아니다" },
  { value: 3, label: "보통이다" },
  { value: 4, label: "그렇다" },
  { value: 5, label: "매우 그렇다" },
];
const ITEM_IDS = items.map((i) => i.id);
const ADVANCE_DELAY_MS = 220;

export default function TestRunner() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  // 저장된 진행 상태 복원 (클라이언트에서만)
  useEffect(() => {
    const saved = loadProgress(ITEM_IDS);
    if (saved) {
      setAnswers(saved.answers);
      setIndex(saved.index);
    }
    setReady(true);
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (ready && !finishing) saveProgress({ answers, index });
  }, [answers, index, ready, finishing]);

  const item = items[index];
  const answeredCount = ITEM_IDS.filter((id) => id in answers).length;
  const isLast = index === items.length - 1;
  const current = answers[item.id];

  const goTo = useCallback((next: number) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setIndex(Math.min(Math.max(next, 0), items.length - 1));
  }, []);

  const select = useCallback(
    (value: number) => {
      setAnswers((prev) => ({ ...prev, [items[index].id]: value }));
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
      if (index < items.length - 1) {
        advanceTimer.current = window.setTimeout(() => setIndex((i) => Math.min(i + 1, items.length - 1)), ADVANCE_DELAY_MS);
      }
    },
    [index],
  );

  const finish = useCallback(() => {
    const firstUnanswered = ITEM_IDS.findIndex((id) => !(id in answers));
    if (firstUnanswered !== -1) {
      goTo(firstUnanswered);
      return;
    }
    setFinishing(true);
    const code = encodeSums(computeRawSums(items, answers), itemsPerDimension);
    saveLastResult(code);
    clearProgress();
    router.push(`/result/?${SHARE_PARAM}=${code}`);
  }, [answers, goTo, router]);

  const restart = () => {
    if (!window.confirm("지금까지의 응답을 지우고 처음부터 다시 할까요?")) return;
    clearProgress();
    setAnswers({});
    goTo(0);
  };

  // 키보드: 1~5 응답, ←/→ 이동
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-5]$/.test(e.key)) select(Number(e.key));
      else if (e.key === "ArrowLeft") goTo(index - 1);
      else if (e.key === "ArrowRight" && current !== undefined && !isLast) goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, select, goTo, index, current, isLast]);

  if (!ready) {
    return <div className="py-24 text-center text-slate-400">불러오는 중…</div>;
  }

  const progress = (answeredCount / items.length) * 100;

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      {/* 진행률 */}
      <div className="sticky top-0 z-10 -mx-4 bg-[#F7F5F2]/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">
            {index + 1} <span className="font-normal text-slate-400">/ {items.length}</span>
          </span>
          <button onClick={restart} className="text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
            처음부터
          </button>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="응답 진행률"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={answeredCount}
        >
          <div className="h-full rounded-full bg-slate-800 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 문항 */}
      <div className="flex flex-1 flex-col justify-center py-8">
        <p key={item.id} className="animate-[fadein_.25s_ease-out] text-center text-2xl font-bold leading-snug text-slate-900 sm:text-[1.75rem]">
          {item.text}
        </p>
      </div>

      {/* 응답 */}
      <fieldset className="space-y-2.5">
        <legend className="sr-only">{item.text}</legend>
        {LIKERT.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left text-base font-medium transition active:scale-[0.99] ${
                selected ? "bg-slate-900 text-white shadow-md" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-slate-400"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  selected ? "bg-white text-slate-900" : "bg-slate-100 text-slate-500"
                }`}
              >
                {opt.value}
              </span>
              {opt.label}
            </button>
          );
        })}
      </fieldset>

      {/* 이동 */}
      <div className="mt-6 flex gap-3 pb-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-2xl px-5 py-3.5 font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white disabled:opacity-40"
        >
          ← 이전
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={finish}
            disabled={current === undefined || finishing}
            className="flex-1 rounded-2xl bg-slate-900 py-3.5 font-bold text-white transition hover:bg-slate-700 disabled:opacity-40"
          >
            {finishing ? "결과 계산 중…" : answeredCount < items.length ? "빠진 문항으로 이동" : "결과 보기"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={current === undefined}
            className="flex-1 rounded-2xl py-3.5 font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white disabled:opacity-40"
          >
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}
