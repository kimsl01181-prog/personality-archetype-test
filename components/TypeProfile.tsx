import Link from "next/link";
import TypeEmblem from "./TypeEmblem";
import { getType } from "@/lib/data";
import { ink, tint } from "@/lib/profile";
import type { PersonalityType } from "@/lib/types";

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function Hashtags({ type }: { type: PersonalityType }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {type.hashtags.map((tag) => (
        <li key={tag} className="rounded-full px-3 py-1 text-sm font-medium" style={{ backgroundColor: tint(type.color, 0.14), color: ink(type.color) }}>
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** 유형 소개 본문: 설명, 강점, 주의할 점, 스타일, 궁합 */
export function TypeDetails({ type }: { type: PersonalityType }) {
  const accent = ink(type.color);
  return (
    <>
      <Section title="이런 사람이에요">
        <p className="leading-relaxed text-slate-700">{type.description}</p>
      </Section>

      <Section title="강점">
        <ul className="space-y-2.5">
          {type.strengths.map((s) => (
            <li key={s} className="flex gap-3 text-slate-700">
              <span className="mt-0.5 font-bold" style={{ color: accent }} aria-hidden>
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="이렇게 하면 더 좋아요">
        <ul className="space-y-3">
          {type.cautions.map((c) => (
            <li key={c} className="rounded-2xl bg-slate-50 p-4 leading-relaxed text-slate-700">
              {c}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="상황별 스타일">
        <dl className="space-y-4">
          {[
            ["💼 일할 때", type.workStyle],
            ["🤝 관계에서", type.relationshipStyle],
            ["🌧️ 스트레스 받을 때", type.underStress],
          ].map(([title, body]) => (
            <div key={title}>
              <dt className="mb-1 font-semibold text-slate-800">{title}</dt>
              <dd className="leading-relaxed text-slate-700">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="궁합">
        <p className="mb-3 text-sm font-semibold text-slate-500">잘 맞는 유형</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {type.goodMatches.map((id) => (
            <MiniTypeCard key={id} type={getType(id)!} />
          ))}
        </div>
        <p className="mb-3 mt-5 text-sm font-semibold text-slate-500">서로 배울 점이 많은 유형</p>
        <MiniTypeCard type={getType(type.growthPartner)!} />
      </Section>
    </>
  );
}

export function MiniTypeCard({ type, note }: { type: PersonalityType; note?: string }) {
  return (
    <Link
      href={`/types/${type.id}/`}
      className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-slate-100 transition hover:bg-slate-50 hover:ring-slate-200"
    >
      <TypeEmblem type={type} size="sm" />
      <div className="min-w-0">
        <p className="font-semibold text-slate-900">{type.name}</p>
        <p className="truncate text-sm text-slate-500">{note ?? type.summary}</p>
      </div>
    </Link>
  );
}
