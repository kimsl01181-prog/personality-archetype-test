/** 점수를 화면 문구로 바꾸는 도우미 */
import { DIMENSION_IDS, type Dimension, type PersonalityType } from "./types";

export interface LevelDescription {
  side: "high" | "low" | "mid";
  /** 예: "꽤 계획형", "양쪽 균형" */
  text: string;
}

export function describeLevel(value: number, dimension: Dimension): LevelDescription {
  const abs = Math.abs(value);
  if (abs < 0.1) return { side: "mid", text: "양쪽 균형" };
  const side = value > 0 ? "high" : "low";
  const label = value > 0 ? dimension.high.label : dimension.low.label;
  const strength = abs < 0.35 ? "약간" : abs < 0.6 ? "꽤" : "뚜렷한";
  return { side, text: `${strength} ${label}` };
}

/** 유형의 특징 차원 라벨 (예: ["사람 충전형", "탐험형"]) */
export function salientPoles(type: PersonalityType, dimensions: Dimension[]): string[] {
  return DIMENSION_IDS.flatMap((id) => {
    const v = type.prototype[id];
    if (Math.abs(v) < 0.4) return [];
    const dim = dimensions.find((d) => d.id === id)!;
    return [v > 0 ? dim.high.label : dim.low.label];
  });
}

/** 대표 색상을 연하게 (배경용) */
export function tint(hex: string, alpha: number): string {
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}

/** 흰 배경 위에서 읽히도록 밝은 색은 어둡게 (글자·아이콘용) */
export function ink(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const factor = luminance > 0.6 ? 0.55 : luminance > 0.45 ? 0.75 : 1;
  return `#${rgb
    .map((c) => Math.round(c * factor).toString(16).padStart(2, "0"))
    .join("")}`;
}
