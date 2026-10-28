import { describe, expect, it } from "vitest";
import { dimensions, items, types } from "@/lib/data";
import { euclideanDistance } from "@/lib/scoring";
import { DIMENSION_IDS } from "@/lib/types";

/** 기존 검사(16Personalities 한국어판, 에니어그램)에서 쓰는 유형명 — 혼동 방지를 위해 사용 금지 */
const BANNED_NAMES = [
  "건축가", "논리술사", "통솔자", "변론가", "옹호자", "중재자", "선도자", "활동가",
  "현실주의자", "수호자", "경영자", "집정관", "장인", "모험가", "사업가", "연예인",
  "평화주의자", "탐구자", "도전자", "개혁가", "조력가", "성취자", "충성가", "열정가",
];
const MIN_PROTOTYPE_DISTANCE = 0.75;

describe("차원 데이터", () => {
  it("6개 차원이 정해진 순서로 있다", () => {
    expect(dimensions.map((d) => d.id)).toEqual([...DIMENSION_IDS]);
  });

  it("양극·중간 상세 해석 문구가 모두 있다", () => {
    for (const d of dimensions) {
      for (const text of [d.high.detail, d.low.detail, d.balanced]) expect(text.length, d.id).toBeGreaterThan(20);
    }
  });
});

describe("문항 데이터", () => {
  it("54문항, id 중복 없음", () => {
    expect(items).toHaveLength(54);
    expect(new Set(items.map((i) => i.id)).size).toBe(54);
  });

  it.each(DIMENSION_IDS)("차원 %s: 9문항, 역채점 4개", (dim) => {
    const dimItems = items.filter((i) => i.dimension === dim);
    expect(dimItems).toHaveLength(9);
    expect(dimItems.filter((i) => i.reverse)).toHaveLength(4);
  });

  it("문장 길이 15~40자", () => {
    for (const item of items) {
      const length = [...item.text].length;
      expect(length, item.text).toBeGreaterThanOrEqual(15);
      expect(length, item.text).toBeLessThanOrEqual(40);
    }
  });

  it("같은 차원 문항이 연달아 나오지 않는다", () => {
    for (let i = 1; i < items.length; i++) {
      expect(items[i].dimension, items[i].id).not.toBe(items[i - 1].dimension);
    }
  });

  it("모든 문항에 참고 구성개념 메모가 있다", () => {
    for (const item of items) expect(item.ipipFacet.length).toBeGreaterThan(0);
  });
});

describe("유형 데이터", () => {
  const ids = new Set(types.map((t) => t.id));

  it("24개 유형, id·이름·색상 중복 없음", () => {
    expect(types).toHaveLength(24);
    expect(ids.size).toBe(24);
    expect(new Set(types.map((t) => t.name)).size).toBe(24);
    expect(new Set(types.map((t) => t.color.toUpperCase())).size).toBe(24);
  });

  it.each(types.map((t) => [t.id, t] as const))("%s: 필수 항목 형식", (_id, t) => {
    expect(t.strengths).toHaveLength(3);
    expect(t.cautions).toHaveLength(2);
    expect(t.hashtags.length).toBeGreaterThanOrEqual(3);
    expect(t.hashtags.length).toBeLessThanOrEqual(5);
    for (const tag of t.hashtags) expect(tag.startsWith("#")).toBe(true);
    expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    const sentences = t.description.split(/[.?!]\s+/).filter(Boolean).length;
    expect(sentences).toBeGreaterThanOrEqual(3);
    expect(sentences).toBeLessThanOrEqual(4);
    for (const field of [t.summary, t.workStyle, t.relationshipStyle, t.underStress]) {
      expect(field.length).toBeGreaterThan(0);
    }
  });

  it.each(types.map((t) => [t.id, t] as const))("%s: 프로토타입 -1~+1, 특징 차원 2~3개", (_id, t) => {
    const values = DIMENSION_IDS.map((d) => t.prototype[d]);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
    const salient = values.filter((v) => Math.abs(v) >= 0.4).length;
    expect(salient).toBeGreaterThanOrEqual(2);
    expect(salient).toBeLessThanOrEqual(3);
  });

  it(`프로토타입 간 최소 거리 ${MIN_PROTOTYPE_DISTANCE} 이상`, () => {
    for (let i = 0; i < types.length; i++) {
      for (let j = i + 1; j < types.length; j++) {
        const d = euclideanDistance(types[i].prototype, types[j].prototype);
        expect(d, `${types[i].id} ↔ ${types[j].id}`).toBeGreaterThanOrEqual(MIN_PROTOTYPE_DISTANCE);
      }
    }
  });

  it("궁합 유형이 실제 id를 가리키고 자기 자신·중복이 없다", () => {
    for (const t of types) {
      expect(t.goodMatches).toHaveLength(2);
      const refs = [...t.goodMatches, t.growthPartner];
      expect(new Set(refs).size, t.id).toBe(3);
      for (const ref of refs) {
        expect(ids.has(ref), `${t.id} → ${ref}`).toBe(true);
        expect(ref).not.toBe(t.id);
      }
    }
  });

  it("기존 검사의 유형명을 쓰지 않는다", () => {
    const text = JSON.stringify(types);
    for (const name of BANNED_NAMES) expect(text.includes(name), name).toBe(false);
  });
});
