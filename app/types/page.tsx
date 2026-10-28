import type { Metadata } from "next";
import Link from "next/link";
import TypeEmblem from "@/components/TypeEmblem";
import { dimensions, types } from "@/lib/data";
import { ink, salientPoles, tint } from "@/lib/profile";

export const metadata: Metadata = { title: "유형 도감" };

export default function TypesPage() {
  return (
    <div className="pb-4 pt-4">
      <h1 className="text-2xl font-extrabold tracking-tight">24가지 유형 도감</h1>
      <p className="mt-2 text-slate-500">유형마다 두세 가지 성향이 뚜렷해요. 카드를 눌러 자세히 보세요.</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {types.map((t) => (
          <li key={t.id}>
            <Link
              href={`/types/${t.id}/`}
              className="flex h-full flex-col items-center rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <TypeEmblem type={t} />
              <p className="mt-3 font-bold leading-snug" style={{ color: ink(t.color) }}>
                {t.name}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.summary}</p>
              <ul className="mt-3 flex flex-wrap justify-center gap-1">
                {salientPoles(t, dimensions).map((p) => (
                  <li key={p} className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: tint(t.color, 0.12), color: ink(t.color) }}>
                    {p}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
