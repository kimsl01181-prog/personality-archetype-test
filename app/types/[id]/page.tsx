import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DimensionBars from "@/components/DimensionBars";
import TypeEmblem from "@/components/TypeEmblem";
import { Hashtags, Section, TypeDetails } from "@/components/TypeProfile";
import { getType, types } from "@/lib/data";
import { ink, tint } from "@/lib/profile";

export const dynamicParams = false;

export function generateStaticParams() {
  return types.map((t) => ({ id: t.id }));
}

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const type = getType((await params).id);
  return type ? { title: type.name, description: `${type.name} — ${type.summary}` } : {};
}

export default async function TypePage({ params }: Params) {
  const type = getType((await params).id);
  if (!type) notFound();

  return (
    <div className="space-y-5 pb-4 pt-2">
      <Link href="/types/" className="text-sm font-medium text-slate-500 hover:text-slate-800">
        ← 유형 도감
      </Link>
      <section className="rounded-3xl p-6 text-center sm:p-8" style={{ backgroundColor: tint(type.color, 0.12) }}>
        <div className="mb-5 flex justify-center">
          <TypeEmblem type={type} size="lg" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: ink(type.color) }}>
          {type.name}
        </h1>
        <p className="mt-2 text-lg text-slate-700">{type.summary}</p>
        <div className="mt-5">
          <Hashtags type={type} />
        </div>
      </section>

      <Section title="이 유형의 성향">
        <DimensionBars vector={type.prototype} color={type.color} />
      </Section>

      <TypeDetails type={type} />

      <Link href="/test/" className="block rounded-2xl bg-slate-900 py-4 text-center font-bold text-white transition hover:bg-slate-700">
        나는 어떤 유형일까? 테스트 하기
      </Link>
    </div>
  );
}
