/**
 * 결과 공유 코드
 *
 * 차원별 원점수 합(문항 7개 기준 7~35, 29가지)을 base36 한 글자로 바꿔
 * X·A·C·E·O·H 순서로 이어 붙인 6글자 코드. 예: "e9kd3p"
 * 응답 원본은 담지 않으며, 코드만으로 점수와 유형을 그대로 다시 계산할 수 있다.
 */
import { DIMENSION_IDS, type DimensionVector } from "./types";
import { LIKERT_MAX, LIKERT_MIN } from "./scoring";

export const SHARE_PARAM = "r";

export function encodeSums(sums: DimensionVector, itemsPerDimension: DimensionVector): string {
  return DIMENSION_IDS.map((dim) => {
    const n = itemsPerDimension[dim];
    const offset = sums[dim] - n * LIKERT_MIN;
    const span = n * (LIKERT_MAX - LIKERT_MIN);
    if (!Number.isInteger(offset) || offset < 0 || offset > span || span >= 36) {
      throw new Error(`차원 ${dim}의 원점수 합이 올바르지 않습니다: ${sums[dim]}`);
    }
    return offset.toString(36);
  }).join("");
}

/** 잘못된 코드면 null */
export function decodeSums(code: string | null | undefined, itemsPerDimension: DimensionVector): DimensionVector | null {
  if (typeof code !== "string") return null;
  const normalized = code.trim().toLowerCase();
  if (normalized.length !== DIMENSION_IDS.length || !/^[0-9a-z]+$/.test(normalized)) return null;

  const sums = { X: 0, A: 0, C: 0, E: 0, O: 0, H: 0 } as DimensionVector;
  for (let i = 0; i < DIMENSION_IDS.length; i++) {
    const dim = DIMENSION_IDS[i];
    const n = itemsPerDimension[dim];
    const offset = parseInt(normalized[i], 36);
    if (offset > n * (LIKERT_MAX - LIKERT_MIN)) return null;
    sums[dim] = n * LIKERT_MIN + offset;
  }
  return sums;
}
