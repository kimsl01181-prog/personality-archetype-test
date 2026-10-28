/**
 * 채점 로직 (순수 함수만 포함 — 데이터는 인자로 받는다)
 *
 * 1. 역채점 문항은 6 - 응답으로 뒤집는다.
 * 2. 차원별 원점수 합(문항 7개 → 7~35)을 구한다.
 * 3. 평균(1~5)을 중앙값 3 기준으로 -1~+1로 정규화한다: (평균 - 3) / 2
 * 4. 24개 유형 프로토타입과의 유클리드 거리로 순위를 매긴다.
 * 5. 일치도(%) = 100 × exp(-거리² / (2σ²)), σ = 0.9
 */
import {
  DIMENSION_IDS,
  type Answers,
  type DimensionId,
  type DimensionVector,
  type Item,
  type PersonalityType,
} from "./types";

export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;
const LIKERT_MID = (LIKERT_MIN + LIKERT_MAX) / 2;
const LIKERT_HALF_RANGE = (LIKERT_MAX - LIKERT_MIN) / 2;

export function isValidResponse(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= LIKERT_MIN && (value as number) <= LIKERT_MAX;
}

/** 역채점 적용: 1↔5, 2↔4, 3은 그대로 */
export function applyReverse(response: number, reverse: boolean): number {
  return reverse ? LIKERT_MIN + LIKERT_MAX - response : response;
}

function emptyVector(): DimensionVector {
  return { X: 0, A: 0, C: 0, E: 0, O: 0, H: 0 };
}

/** 차원별 문항 수 */
export function countItemsPerDimension(items: Item[]): DimensionVector {
  const counts = emptyVector();
  for (const item of items) counts[item.dimension] += 1;
  return counts;
}

/**
 * 차원별 원점수 합(역채점 반영). 모든 문항에 1~5 정수 응답이 있어야 한다.
 * 누락·범위 밖 응답이 있으면 에러를 던진다.
 */
export function computeRawSums(items: Item[], answers: Answers): DimensionVector {
  const sums = emptyVector();
  for (const item of items) {
    const response = answers[item.id];
    if (!isValidResponse(response)) {
      throw new Error(`문항 ${item.id}의 응답이 없거나 1~5 범위를 벗어났습니다: ${String(response)}`);
    }
    sums[item.dimension] += applyReverse(response, item.reverse);
  }
  return sums;
}

/** 원점수 합 → 정규화 점수(-1~+1). 공유 URL 복원도 이 함수를 거친다. */
export function sumsToVector(sums: DimensionVector, itemsPerDimension: DimensionVector): DimensionVector {
  const vector = emptyVector();
  for (const dim of DIMENSION_IDS) {
    const n = itemsPerDimension[dim];
    if (n <= 0) throw new Error(`차원 ${dim}에 문항이 없습니다`);
    const mean = sums[dim] / n;
    vector[dim] = (mean - LIKERT_MID) / LIKERT_HALF_RANGE;
  }
  return vector;
}

/** 응답 → 정규화 점수(-1~+1) */
export function scoreAnswers(items: Item[], answers: Answers): DimensionVector {
  return sumsToVector(computeRawSums(items, answers), countItemsPerDimension(items));
}

export function euclideanDistance(a: DimensionVector, b: DimensionVector): number {
  let sq = 0;
  for (const dim of DIMENSION_IDS) sq += (a[dim] - b[dim]) ** 2;
  return Math.sqrt(sq);
}

/**
 * 일치도 계산의 폭(σ). 거리가 σ일 때 약 61%, 2σ일 때 약 14%.
 * 선형 방식(1 - d/d_max)은 대부분 사람이 75~85%에 몰려 변별력이 없어 가우시안으로 바꿨다.
 */
export const MATCH_SIGMA = 0.9;

/** 거리 → 일치도(0~100 정수). 거리 0이면 100, 멀어질수록 0에 가까워진다. */
export function matchPercent(distance: number): number {
  return Math.round(100 * Math.exp(-(distance ** 2) / (2 * MATCH_SIGMA ** 2)));
}

export interface RankedType {
  type: PersonalityType;
  distance: number;
  match: number;
}

/** 가까운 순으로 정렬한 전체 유형 목록. 거리가 같으면 데이터 순서를 따른다(재현성). */
export function rankTypes(vector: DimensionVector, types: PersonalityType[]): RankedType[] {
  return types
    .map((type, index) => {
      const distance = euclideanDistance(vector, type.prototype);
      return { type, distance, match: matchPercent(distance), index };
    })
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map(({ type, distance, match }) => ({ type, distance, match }));
}

export interface TestResult {
  vector: DimensionVector;
  main: RankedType;
  /** 숨은 닮은꼴: 두 번째로 가까운 유형 */
  hidden: RankedType;
  ranking: RankedType[];
}

export function resultFromVector(vector: DimensionVector, types: PersonalityType[]): TestResult {
  if (types.length < 2) throw new Error("유형이 2개 이상 필요합니다");
  const ranking = rankTypes(vector, types);
  return { vector, main: ranking[0], hidden: ranking[1], ranking };
}

export function computeResult(items: Item[], answers: Answers, types: PersonalityType[]): TestResult {
  return resultFromVector(scoreAnswers(items, answers), types);
}

/** 차원 점수(-1~+1)를 막대 그래프용 0~100으로 변환 (50 = 중간) */
export function toPercentScale(value: number): number {
  return Math.round(((Math.max(-1, Math.min(1, value)) + 1) / 2) * 100);
}

export function isDimensionId(value: string): value is DimensionId {
  return (DIMENSION_IDS as readonly string[]).includes(value);
}
