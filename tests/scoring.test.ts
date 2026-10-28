import { describe, expect, it } from "vitest";
import {
  applyReverse,
  computeRawSums,
  computeResult,
  euclideanDistance,
  MATCH_SIGMA,
  matchPercent,
  rankTypes,
  resultFromVector,
  scoreAnswers,
  sumsToVector,
  toPercentScale,
} from "@/lib/scoring";
import { items, itemsPerDimension, types } from "@/lib/data";
import { DIMENSION_IDS, type Answers, type DimensionVector, type Item, type PersonalityType } from "@/lib/types";

const ZERO: DimensionVector = { X: 0, A: 0, C: 0, E: 0, O: 0, H: 0 };

function answerAll(value: number): Answers {
  return Object.fromEntries(items.map((item) => [item.id, value]));
}

/** 프로토타입 부호대로 극단적으로 응답 (+면 해당 성향 최대, -면 최소, 0이면 중간) */
function answersFor(type: PersonalityType): Answers {
  const answers: Answers = {};
  for (const item of items) {
    const p = type.prototype[item.dimension];
    const target = p > 0 ? 5 : p < 0 ? 1 : 3;
    answers[item.id] = item.reverse ? 6 - target : target;
  }
  return answers;
}

describe("역채점", () => {
  it("1↔5, 2↔4를 뒤집고 3은 유지한다", () => {
    expect([1, 2, 3, 4, 5].map((v) => applyReverse(v, true))).toEqual([5, 4, 3, 2, 1]);
    expect([1, 2, 3, 4, 5].map((v) => applyReverse(v, false))).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("원점수 합과 정규화", () => {
  const mini: Item[] = [
    { id: "a", text: "", dimension: "X", reverse: false, ipipFacet: "" },
    { id: "b", text: "", dimension: "X", reverse: true, ipipFacet: "" },
  ];

  it("역채점을 반영해 차원별로 합산한다", () => {
    const sums = computeRawSums(mini, { a: 5, b: 1 });
    expect(sums.X).toBe(10); // 5 + (6-1)
    expect(sums.A).toBe(0);
  });

  it("모든 응답이 3이면 모든 차원이 0이다", () => {
    expect(scoreAnswers(items, answerAll(3))).toEqual(ZERO);
  });

  it("평균 5 → +1, 평균 1 → -1, 평균 3 → 0", () => {
    const n = { X: 1, A: 1, C: 1, E: 1, O: 1, H: 1 };
    const v = sumsToVector({ X: 5, A: 1, C: 3, E: 4, O: 2, H: 3 }, n);
    expect(v).toEqual({ X: 1, A: -1, C: 0, E: 0.5, O: -0.5, H: 0 });
  });

  it("모두 5로 답하면 정채점은 5점, 역채점은 1점으로 평균이 난다", () => {
    const v = scoreAnswers(items, answerAll(5));
    for (const dim of DIMENSION_IDS) {
      const dimItems = items.filter((i) => i.dimension === dim);
      const reversed = dimItems.filter((i) => i.reverse).length;
      const mean = (5 * (dimItems.length - reversed) + 1 * reversed) / dimItems.length;
      expect(v[dim]).toBeCloseTo((mean - 3) / 2, 10);
    }
  });

  it("점수는 항상 -1~+1 범위다", () => {
    for (const t of types) {
      const v = scoreAnswers(items, answersFor(t));
      for (const dim of DIMENSION_IDS) {
        expect(v[dim]).toBeGreaterThanOrEqual(-1);
        expect(v[dim]).toBeLessThanOrEqual(1);
      }
    }
  });

  it("응답이 빠지거나 범위를 벗어나면 에러를 던진다", () => {
    const missing = answerAll(3);
    delete missing[items[0].id];
    expect(() => scoreAnswers(items, missing)).toThrow();
    expect(() => scoreAnswers(items, { ...answerAll(3), [items[0].id]: 6 })).toThrow();
    expect(() => scoreAnswers(items, { ...answerAll(3), [items[0].id]: 0 })).toThrow();
    expect(() => scoreAnswers(items, { ...answerAll(3), [items[0].id]: 2.5 })).toThrow();
  });

  it("차원별 문항 수는 9개씩이다", () => {
    for (const dim of DIMENSION_IDS) expect(itemsPerDimension[dim]).toBe(9);
  });
});

describe("거리와 일치도", () => {
  it("유클리드 거리를 계산한다", () => {
    expect(euclideanDistance(ZERO, ZERO)).toBe(0);
    expect(euclideanDistance(ZERO, { ...ZERO, X: 0.6, A: 0.8 })).toBeCloseTo(1, 10);
  });

  it("거리 0이면 100%, σ이면 약 61%, 아주 멀면 0%", () => {
    expect(matchPercent(0)).toBe(100);
    expect(matchPercent(MATCH_SIGMA)).toBe(61); // exp(-1/2)
    expect(matchPercent(2 * MATCH_SIGMA)).toBe(14); // exp(-2)
    expect(matchPercent(10)).toBe(0);
  });

  it("거리가 멀수록 일치도가 낮아진다", () => {
    for (let d = 0; d < 3; d += 0.1) expect(matchPercent(d + 0.1)).toBeLessThanOrEqual(matchPercent(d));
  });

  it("어떤 응답이든 일치도는 0~100 정수다", () => {
    for (const value of [1, 2, 3, 4, 5]) {
      for (const r of rankTypes(scoreAnswers(items, answerAll(value)), types)) {
        expect(Number.isInteger(r.match)).toBe(true);
        expect(r.match).toBeGreaterThanOrEqual(0);
        expect(r.match).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("유형 판정", () => {
  it.each(types.map((t) => [t.name, t] as const))("%s 성향대로 답하면 그 유형이 나온다", (_name, type) => {
    const result = computeResult(items, answersFor(type), types);
    expect(result.main.type.id).toBe(type.id);
    expect(result.hidden.type.id).not.toBe(type.id);
  });

  it("프로토타입 자체를 넣으면 거리 0, 일치도 100%", () => {
    for (const t of types) {
      const result = resultFromVector(t.prototype, types);
      expect(result.main.type.id).toBe(t.id);
      expect(result.main.distance).toBe(0);
      expect(result.main.match).toBe(100);
    }
  });

  it("순위는 거리 오름차순이고 24개 전부를 포함한다", () => {
    const ranking = rankTypes({ X: 0.2, A: -0.1, C: 0.4, E: 0, O: -0.3, H: 0.1 }, types);
    expect(ranking).toHaveLength(types.length);
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i].distance).toBeGreaterThanOrEqual(ranking[i - 1].distance);
    }
    expect(resultFromVector({ X: 0.2, A: -0.1, C: 0.4, E: 0, O: -0.3, H: 0.1 }, types).hidden).toEqual(ranking[1]);
  });

  it("거리가 같으면 데이터 순서로 정해져 결과가 재현된다", () => {
    const a = resultFromVector(ZERO, types);
    const b = resultFromVector(ZERO, types);
    expect(a.main.type.id).toBe(b.main.type.id);
    expect(a.hidden.type.id).toBe(b.hidden.type.id);
  });

  it("유형이 2개 미만이면 에러", () => {
    expect(() => resultFromVector(ZERO, types.slice(0, 1))).toThrow();
  });
});

describe("막대 그래프 변환", () => {
  it("-1 → 0, 0 → 50, +1 → 100", () => {
    expect(toPercentScale(-1)).toBe(0);
    expect(toPercentScale(0)).toBe(50);
    expect(toPercentScale(1)).toBe(100);
    expect(toPercentScale(2)).toBe(100);
  });
});
