import Link from "next/link";
import StartActions from "@/components/StartActions";
import TypeEmblem from "@/components/TypeEmblem";
import { dimensions, items, types } from "@/lib/data";

const PREVIEW_IDS = ["pioneer", "designer", "companion", "dreamer", "vanguard", "lighthouse-keeper"];

export default function Home() {
  const preview = PREVIEW_IDS.map((id) => types.find((t) => t.id === id)!);
  return (
    <div className="space-y-8 pb-4 pt-6">
      <section className="text-center">
        <div className="mb-6 flex justify-center -space-x-3">
          {preview.map((t) => (
            <TypeEmblem key={t.id} type={t} size="sm" />
          ))}
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
          나는 어떤 사람일까?
          <br />
          <span className="text-slate-500">24가지 성향 아키타입</span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-slate-600">
          일상 속 {items.length}개 질문에 답하면 6가지 성격 차원을 분석해 나와 가장 가까운 유형을 찾아드려요.
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-medium text-slate-600">
          <li className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">⏱ 약 6~8분</li>
          <li className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">📝 {items.length}문항</li>
          <li className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">🔒 개인정보 수집 없음</li>
        </ul>
      </section>

      <StartActions />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="mb-1 text-lg font-bold">무엇을 측정하나요?</h2>
        <p className="mb-4 text-sm text-slate-500">HEXACO 성격 모델과 Big Five 연구를 참고한 6가지 차원이에요. 양쪽 모두 각자의 강점이 있어요.</p>
        <ul className="divide-y divide-slate-100">
          {dimensions.map((d) => (
            <li key={d.id} className="py-3">
              <p className="font-semibold text-slate-800">
                {d.name} <span className="text-xs font-normal text-slate-400">{d.academic}</span>
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                {d.low.label} ↔ {d.high.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <h2 className="mb-2 text-lg font-bold text-slate-900">답할 때 팁</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>정답은 없어요. 되고 싶은 나보다 평소의 나에 가깝게 답해 주세요.</li>
          <li>너무 오래 고민하지 말고 처음 떠오르는 느낌으로 골라 주세요.</li>
          <li>중간에 나가도 이 기기에서 이어서 할 수 있어요.</li>
        </ul>
      </section>

      <p className="text-center">
        <Link href="/types/" className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline">
          24가지 유형 먼저 둘러보기 →
        </Link>
      </p>
    </div>
  );
}
