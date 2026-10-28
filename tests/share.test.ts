import { describe, expect, it } from "vitest";
import { decodeShare, encodeSums } from "@/lib/share";
import { computeRawSums, resultFromVector, scoreAnswers, sumsToVector } from "@/lib/scoring";
import { items, itemsPerDimension, types } from "@/lib/data";
import type { Answers, DimensionVector } from "@/lib/types";

function randomAnswers(seed: number): Answers {
  // 재현 가능한 의사난수 (LCG)
  let s = seed;
  const next = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  return Object.fromEntries(items.map((item) => [item.id, 1 + Math.floor(next() * 5)]));
}

const all = (n: number): DimensionVector => ({ X: n, A: n, C: n, E: n, O: n, H: n });

describe("공유 코드 (v2)", () => {
  it("버전 '2' + 6글자로 인코딩된다", () => {
    const code = encodeSums(computeRawSums(items, randomAnswers(1)), itemsPerDimension);
    expect(code).toMatch(/^2[0-9a-zA-Z]{6}$/);
  });

  it("최소·최대 점수도 왕복 변환된다 (차원당 9문항 → 9~45)", () => {
    expect(encodeSums(all(9), itemsPerDimension)).toBe("2000000");
    expect(encodeSums(all(45), itemsPerDimension)).toBe("2AAAAAA"); // 36번째 글자 = 'A'
    expect(decodeShare("2000000", itemsPerDimension)?.sums).toEqual(all(9));
    expect(decodeShare("2AAAAAA", itemsPerDimension)?.sums).toEqual(all(45));
  });

  it("코드만으로 같은 점수와 같은 유형이 재현된다", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const answers = randomAnswers(seed);
      const sums = computeRawSums(items, answers);
      const decoded = decodeShare(encodeSums(sums, itemsPerDimension), itemsPerDimension);
      expect(decoded?.sums).toEqual(sums);

      const original = resultFromVector(scoreAnswers(items, answers), types);
      const restored = resultFromVector(sumsToVector(decoded!.sums, decoded!.itemsPerDimension), types);
      expect(restored.main.type.id).toBe(original.main.type.id);
      expect(restored.hidden.type.id).toBe(original.hidden.type.id);
      expect(restored.main.match).toBe(original.main.match);
    }
  });

  it("대소문자를 구분한다 (a와 A는 다른 값)", () => {
    expect(decodeShare("2aaaaaa", itemsPerDimension)?.sums).toEqual(all(9 + 10));
    expect(decodeShare("2AAAAAA", itemsPerDimension)?.sums).toEqual(all(9 + 36));
  });

  it("범위를 벗어난 원점수는 인코딩을 거부한다", () => {
    expect(() => encodeSums({ ...all(9), X: 8 }, itemsPerDimension)).toThrow();
    expect(() => encodeSums({ ...all(9), X: 46 }, itemsPerDimension)).toThrow();
  });
});

describe("공유 코드 (v1, 42문항 시절 링크 호환)", () => {
  it("6글자 36진수 코드는 차원당 7문항 기준으로 읽는다", () => {
    const decoded = decodeShare("000000", itemsPerDimension);
    expect(decoded?.sums).toEqual(all(7));
    expect(decoded?.itemsPerDimension).toEqual(all(7));
    expect(decodeShare("ssssss", itemsPerDimension)?.sums).toEqual(all(35));
  });

  it("구버전 코드도 같은 점수 벡터로 복원된다", () => {
    const decoded = decodeShare("ifafcc", itemsPerDimension)!;
    const v = sumsToVector(decoded.sums, decoded.itemsPerDimension);
    // i=18 → 원점수 25 → 평균 25/7
    expect(v.X).toBeCloseTo((25 / 7 - 3) / 2, 10);
  });

  it("구버전은 대소문자를 구분하지 않는다", () => {
    expect(decodeShare("IFAFCC", itemsPerDimension)).toEqual(decodeShare("ifafcc", itemsPerDimension));
  });
});

describe("잘못된 코드", () => {
  it.each([null, undefined, "", "abc", "2abc", "abcdefgh", "ttttt0", "zzzzzz", "2ZZZZZZ", "3000000", "ab-cde", "2ab-cde", "가나다라마바"])(
    "%s 는 null",
    (code) => {
      expect(decodeShare(code as string | null | undefined, itemsPerDimension)).toBeNull();
    },
  );
});
