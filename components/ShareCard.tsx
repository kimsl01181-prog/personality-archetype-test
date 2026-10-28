import { forwardRef } from "react";
import SymbolIcon from "./SymbolIcon";
import { dimensions } from "@/lib/data";
import { describeLevel, ink, tint } from "@/lib/profile";
import { toPercentScale } from "@/lib/scoring";
import type { DimensionVector, PersonalityType } from "@/lib/types";

interface Props {
  type: PersonalityType;
  vector: DimensionVector;
  match: number;
  hidden: PersonalityType;
}

/** 이미지로 저장되는 결과 카드. html-to-image 호환을 위해 차트 라이브러리 없이 순수 HTML로만 그린다. */
const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard({ type, vector, match, hidden }, ref) {
  const accent = ink(type.color);
  return (
    <div ref={ref} className="mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: tint(type.color, 0.12) }}>
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white" style={{ color: accent }}>
          <SymbolIcon symbol={type.symbol} className="h-12 w-12" />
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-500">나의 성향 아키타입</p>
        <p className="mt-1 text-2xl font-extrabold" style={{ color: accent }}>
          {type.name}
        </p>
        <p className="mt-1.5 text-sm text-slate-600">{type.summary}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">일치도 {match}%</p>
      </div>

      <ul className="mt-5 space-y-2.5">
        {dimensions.map((d) => {
          const pos = toPercentScale(vector[d.id]);
          return (
            <li key={d.id} className="text-xs">
              <div className="mb-1 flex justify-between text-slate-500">
                <span className="font-semibold text-slate-700">{d.name}</span>
                <span>{describeLevel(vector[d.id], d).text}</span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-100">
                <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${pos}%`, backgroundColor: type.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 text-center text-xs text-slate-500">
        숨은 닮은꼴 <span className="font-semibold text-slate-700">{hidden.name}</span>
      </p>
      <p className="mt-2 text-center text-xs font-medium" style={{ color: accent }}>
        {type.hashtags.join(" ")}
      </p>
    </div>
  );
});

export default ShareCard;
