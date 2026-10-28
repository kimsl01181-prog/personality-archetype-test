/**
 * 결과 공유 코드
 *
 * v2 (현재): "2" + 6글자. 차원별 원점수 합에서 최솟값을 뺀 값(문항 9개 기준 0~36)을
 *            62진수 한 글자(0-9a-zA-Z)로 바꿔 X·A·C·E·O·H 순서로 이어 붙인다. 예: "2kAb9cd"
 * v1 (구버전, 42문항 시절): 6글자 36진수, 차원당 7문항 기준. 이미 공유된 링크를 위해 읽기만 지원한다.
 *
 * 응답 원본은 담지 않으며, 코드만으로 점수와 유형을 그대로 다시 계산할 수 있다.
 */
import { DIMENSION_IDS, type DimensionVector } from "./types";
import { LIKERT_MAX, LIKERT_MIN } from "./scoring";

export const SHARE_PARAM = "r";
const VERSION = "2";
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LEGACY_ITEMS_PER_DIMENSION = 7;

export interface DecodedShare {
  sums: DimensionVector;
  /** 이 코드가 만들어질 때의 차원별 문항 수 (점수 정규화에 필요) */
  itemsPerDimension: DimensionVector;
}

const SPAN = LIKERT_MAX - LIKERT_MIN;

export function encodeSums(sums: DimensionVector, itemsPerDimension: DimensionVector): string {
  return (
    VERSION +
    DIMENSION_IDS.map((dim) => {
      const n = itemsPerDimension[dim];
      const offset = sums[dim] - n * LIKERT_MIN;
      if (!Number.isInteger(offset) || offset < 0 || offset > n * SPAN || n * SPAN >= ALPHABET.length) {
        throw new Error(`차원 ${dim}의 원점수 합이 올바르지 않습니다: ${sums[dim]}`);
      }
      return ALPHABET[offset];
    }).join("")
  );
}

function decodeWith(chars: string, n: DimensionVector, toOffset: (c: string) => number): DecodedShare | null {
  const sums = { X: 0, A: 0, C: 0, E: 0, O: 0, H: 0 } as DimensionVector;
  for (let i = 0; i < DIMENSION_IDS.length; i++) {
    const dim = DIMENSION_IDS[i];
    const offset = toOffset(chars[i]);
    if (offset < 0 || offset > n[dim] * SPAN) return null;
    sums[dim] = n[dim] * LIKERT_MIN + offset;
  }
  return { sums, itemsPerDimension: n };
}

/** 잘못된 코드면 null */
export function decodeShare(code: string | null | undefined, itemsPerDimension: DimensionVector): DecodedShare | null {
  if (typeof code !== "string") return null;
  const c = code.trim();

  if (c.length === DIMENSION_IDS.length + 1 && c[0] === VERSION) {
    const body = c.slice(1);
    if ([...body].some((ch) => !ALPHABET.includes(ch))) return null;
    return decodeWith(body, itemsPerDimension, (ch) => ALPHABET.indexOf(ch));
  }

  if (c.length === DIMENSION_IDS.length && /^[0-9a-zA-Z]+$/.test(c)) {
    const legacy = Object.fromEntries(DIMENSION_IDS.map((d) => [d, LEGACY_ITEMS_PER_DIMENSION])) as DimensionVector;
    return decodeWith(c.toLowerCase(), legacy, (ch) => parseInt(ch, 36));
  }

  return null;
}
