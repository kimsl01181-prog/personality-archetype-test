import { describe, expect, it } from "vitest";
import { decodeSums, encodeSums } from "@/lib/share";
import { computeRawSums, resultFromVector, scoreAnswers, sumsToVector } from "@/lib/scoring";
import { items, itemsPerDimension, types } from "@/lib/data";
import type { Answers } from "@/lib/types";

function randomAnswers(seed: number): Answers {
  // 재현 가능한 의사난수 (LCG)
  let s = seed;
  const next = () => (s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  return Object.fromEntries(items.map((item) => [item.id, 1 + Math.floor(next() * 5)]));
}

describe("공유 코드", () => {
  it("6글자 코드로 인코딩된다", () => {
    const code = encodeSums(computeRawSums(items, randomAnswers(1)), itemsPerDimension);
    expect(code).toMatch(/^[0-9a-s]{6}$/);
  });

  it("최소·최대 점수도 왕복 변환된다", () => {
    const min = { X: 7, A: 7, C: 7, E: 7, O: 7, H: 7 };
    const max = { X: 35, A: 35, C: 35, E: 35, O: 35, H: 35 };
    expect(encodeSums(min, itemsPerDimension)).toBe("000000");
    expect(encodeSums(max, itemsPerDimension)).toBe("ssssss");
    expect(decodeSums("000000", itemsPerDimension)).toEqual(min);
    expect(decodeSums("ssssss", itemsPerDimension)).toEqual(max);
  });

  it("코드만으로 같은 점수와 같은 유형이 재현된다", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const answers = randomAnswers(seed);
      const sums = computeRawSums(items, answers);
      const decoded = decodeSums(encodeSums(sums, itemsPerDimension), itemsPerDimension);
      expect(decoded).toEqual(sums);

      const original = resultFromVector(scoreAnswers(items, answers), types);
      const restored = resultFromVector(sumsToVector(decoded!, itemsPerDimension), types);
      expect(restored.main.type.id).toBe(original.main.type.id);
      expect(restored.hidden.type.id).toBe(original.hidden.type.id);
      expect(restored.main.match).toBe(original.main.match);
    }
  });

  it("대문자·앞뒤 공백도 허용한다", () => {
    expect(decodeSums("  SSSSSS ", itemsPerDimension)).toEqual(decodeSums("ssssss", itemsPerDimension));
  });

  it.each([null, undefined, "", "abc", "abcdefg", "ttttt0", "zzzzzz", "ab-cde", "가나다라마바"])(
    "잘못된 코드 %s 는 null",
    (code) => {
      expect(decodeSums(code as string | null | undefined, itemsPerDimension)).toBeNull();
    },
  );

  it("범위를 벗어난 원점수는 인코딩을 거부한다", () => {
    expect(() => encodeSums({ X: 6, A: 7, C: 7, E: 7, O: 7, H: 7 }, itemsPerDimension)).toThrow();
    expect(() => encodeSums({ X: 36, A: 7, C: 7, E: 7, O: 7, H: 7 }, itemsPerDimension)).toThrow();
  });
});
