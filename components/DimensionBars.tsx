import { dimensions } from "@/lib/data";
import { describeLevel } from "@/lib/profile";
import { toPercentScale } from "@/lib/scoring";
import type { DimensionVector } from "@/lib/types";

/** 차원별 양극 막대. 가운데가 중간(0), 왼쪽이 낮은 극, 오른쪽이 높은 극. */
export default function DimensionBars({ vector, color }: { vector: DimensionVector; color: string }) {
  return (
    <ul className="space-y-5">
      {dimensions.map((dim) => {
        const value = vector[dim.id];
        const pos = toPercentScale(value);
        const level = describeLevel(value, dim);
        const left = Math.min(pos, 50);
        const width = Math.abs(pos - 50);
        return (
          <li key={dim.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="font-semibold text-slate-800">
                {dim.name} <span className="text-xs font-normal text-slate-400">{dim.academic}</span>
              </span>
              <span className="text-sm font-medium text-slate-600">{level.text}</span>
            </div>
            <div
              className="relative h-3 rounded-full bg-slate-100"
              role="meter"
              aria-label={`${dim.name}: ${level.text}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pos}
            >
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
              <div className="absolute inset-y-0 rounded-full" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }} />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-sm"
                style={{ left: `${pos}%`, borderColor: color }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-slate-500">
              <span className={level.side === "low" ? "font-semibold text-slate-700" : ""}>{dim.low.label}</span>
              <span className={level.side === "high" ? "font-semibold text-slate-700" : ""}>{dim.high.label}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
