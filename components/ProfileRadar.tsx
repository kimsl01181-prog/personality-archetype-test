"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { dimensions } from "@/lib/data";
import { toPercentScale } from "@/lib/scoring";
import type { DimensionVector } from "@/lib/types";

interface Props {
  vector: DimensionVector;
  color: string;
  /** 비교용 유형 프로토타입 (점선) */
  compare?: { vector: DimensionVector; label: string };
  label?: string;
}

export default function ProfileRadar({ vector, color, compare, label = "나" }: Props) {
  const data = dimensions.map((d) => ({
    axis: d.name,
    value: toPercentScale(vector[d.id]),
    compare: compare ? toPercentScale(compare.vector[d.id]) : undefined,
  }));

  return (
    <div>
      <div className="h-72 w-full" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="axis" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} tickCount={5} />
            {compare && (
              <Radar dataKey="compare" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} fill="none" isAnimationActive={false} />
            )}
            <Radar dataKey="value" stroke={color} strokeWidth={2.5} fill={color} fillOpacity={0.25} isAnimationActive={false} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-sm" style={{ backgroundColor: color }} />
          {label}
        </span>
        {compare && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed border-slate-400" />
            {compare.label}
          </span>
        )}
      </div>
      <p className="sr-only">
        {dimensions.map((d) => `${d.name} ${toPercentScale(vector[d.id])}점`).join(", ")}
      </p>
    </div>
  );
}
