export const DIMENSION_IDS = ["X", "A", "C", "E", "O", "H"] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];

/** 6차원 값. 정규화된 점수(-1 ~ +1)나 원점수 합 등 차원별 숫자를 담는다. */
export type DimensionVector = Record<DimensionId, number>;

export interface PoleInfo {
  label: string;
  description: string;
}

export interface Dimension {
  id: DimensionId;
  name: string;
  academic: string;
  academicEn: string;
  description: string;
  high: PoleInfo;
  low: PoleInfo;
}

export interface Item {
  id: string;
  text: string;
  dimension: DimensionId;
  reverse: boolean;
  ipipFacet: string;
}

export interface PersonalityType {
  id: string;
  name: string;
  symbol: string;
  symbolLabel: string;
  color: string;
  prototype: DimensionVector;
  summary: string;
  description: string;
  strengths: string[];
  cautions: string[];
  workStyle: string;
  relationshipStyle: string;
  underStress: string;
  goodMatches: string[];
  growthPartner: string;
  hashtags: string[];
}

/** 문항 id → 응답(1~5) */
export type Answers = Record<string, number>;
