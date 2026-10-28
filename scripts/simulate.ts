/**
 * 유형 분포 검증 시뮬레이션
 *
 *   npm run simulate                 # 10,000건 × 2개 시나리오 검증 → docs/simulation-results.md 기록
 *   npm run simulate -- --calibrate  # 프로토타입 크기를 미세조정해 data/types.json에 반영한 뒤 검증
 *
 * 시나리오
 *   A. 정규분포 응답: 문항마다 독립적으로 N(3, 1)을 반올림하고 1~5로 자른 값
 *   B. 완전 무작위 응답: 문항마다 1~5 균등분포
 *   C. (참고) 사회적 바람직성 편향: A에 더해 관계 온도·계획성·담백함을 0.5점씩 '좋아 보이는 쪽'으로 응답
 *
 * 기준: A·B에서 모든 유형이 1.5% 이상 9% 이하 (이상적 비율 1/24 ≈ 4.17%). C는 한계 파악용으로 판정에서 제외.
 */
import fs from "node:fs";
import path from "node:path";
import { items, itemsPerDimension, types } from "../lib/data";
import { computeRawSums, euclideanDistance, rankTypes, sumsToVector } from "../lib/scoring";
import { DIMENSION_IDS, type Answers, type DimensionVector, type PersonalityType } from "../lib/types";

const N = 10_000;
const MIN_SHARE = 1.5;
const MAX_SHARE = 9;
const IDEAL_SHARE = 100 / types.length;
const VERIFY_SEEDS = { normal: 20261028, uniform: 19870301, desirability: 4242 };
const DESIRABILITY_BIAS = 0.5;
const DESIRABLE_DIMENSIONS = new Set(["A", "C", "H"]);
const CALIBRATION_SEEDS = { normal: 1111, uniform: 2222 }; // 검증과 다른 표본으로 조정(과적합 방지)

const ROOT = path.resolve(__dirname, "..");
const TYPES_PATH = path.join(ROOT, "data", "types.json");
const REPORT_PATH = path.join(ROOT, "docs", "simulation-results.md");

// ── 재현 가능한 난수 ─────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  // Box-Muller
  return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
}

type Scenario = "normal" | "uniform" | "desirability";
const SCENARIO_LABEL: Record<Scenario, string> = {
  normal: "A. 정규분포 응답 (평균 3, SD 1)",
  uniform: "B. 완전 무작위 응답 (1~5 균등)",
  desirability: "C. (참고) 사회적 바람직성 편향",
};

function sampleAnswers(scenario: Scenario, rand: () => number): Answers {
  const answers: Answers = {};
  for (const item of items) {
    if (scenario === "uniform") {
      answers[item.id] = 1 + Math.floor(rand() * 5);
      continue;
    }
    const bias =
      scenario === "desirability" && DESIRABLE_DIMENSIONS.has(item.dimension) ? (item.reverse ? -1 : 1) * DESIRABILITY_BIAS : 0;
    answers[item.id] = Math.min(5, Math.max(1, Math.round(3 + bias + gaussian(rand))));
  }
  return answers;
}

function sampleVectors(scenario: Scenario, n: number, seed: number): DimensionVector[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => sumsToVector(computeRawSums(items, sampleAnswers(scenario, rand)), itemsPerDimension));
}

// ── 분포 계산 ───────────────────────────────────────────────────
interface Distribution {
  shares: number[]; // 유형 순서대로 %
  mainMatchMedian: number;
  hiddenMatchMedian: number;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function distribution(vectors: DimensionVector[], typeList: PersonalityType[]): Distribution {
  const counts = new Array(typeList.length).fill(0);
  const index = new Map(typeList.map((t, i) => [t.id, i]));
  const mainMatches: number[] = [];
  const hiddenMatches: number[] = [];
  for (const v of vectors) {
    const ranking = rankTypes(v, typeList);
    counts[index.get(ranking[0].type.id)!] += 1;
    mainMatches.push(ranking[0].match);
    hiddenMatches.push(ranking[1].match);
  }
  return {
    shares: counts.map((c) => (c / vectors.length) * 100),
    mainMatchMedian: median(mainMatches),
    hiddenMatchMedian: median(hiddenMatches),
  };
}

/** 가장 가까운 유형만 빠르게 (보정 반복용) */
function fastShares(vectors: DimensionVector[], protos: number[][]): number[] {
  const counts = new Array(protos.length).fill(0);
  for (const v of vectors) {
    const u = DIMENSION_IDS.map((d) => v[d]);
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < protos.length; i++) {
      let d = 0;
      for (let k = 0; k < 6; k++) d += (u[k] - protos[i][k]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    counts[best] += 1;
  }
  return counts.map((c) => (c / vectors.length) * 100);
}

// ── 프로토타입 크기 보정 ─────────────────────────────────────────
/**
 * 응답 벡터는 대부분 중심 근처에 몰리므로, 프로토타입이 중심에서 멀수록(크기가 클수록) 그 유형 비율이 줄어든다.
 * 비율이 높은 유형은 크기를 키우고 낮은 유형은 줄이는 것을 반복한다. 방향(어느 차원이 +/-인지)은 바꾸지 않는다.
 */
function calibrate(typeList: PersonalityType[]): PersonalityType[] {
  const vectors = [
    ...sampleVectors("normal", 20_000, CALIBRATION_SEEDS.normal),
    ...sampleVectors("uniform", 20_000, CALIBRATION_SEEDS.uniform),
  ];
  const base = typeList.map((t) => DIMENSION_IDS.map((d) => t.prototype[d]));
  let scale = new Array(typeList.length).fill(1);
  const protosFor = (s: number[]) => base.map((p, i) => p.map((x) => Math.round(x * s[i] * 100) / 100));

  // 비율은 크기에 매우 민감하므로(크기 1% 변화 → 비율 약 10% 변화) 작은 보폭으로 여러 번 조정한다.
  // 원래 설계를 지키기 위해 크기 변화는 ±15% 안으로 제한한다.
  const STEP = 0.03;
  const MAX_CHANGE = 0.15;
  for (let iter = 0; iter < 150; iter++) {
    const shares = fastShares(vectors, protosFor(scale));
    scale = scale.map((s, i) => s * Math.pow(Math.max(shares[i], 0.1) / IDEAL_SHARE, STEP));
    const mean = scale.reduce((a, b) => a + b, 0) / scale.length;
    scale = scale.map((s) => Math.min(1 + MAX_CHANGE, Math.max(1 - MAX_CHANGE, s / mean)));
  }

  const protos = protosFor(scale);
  return typeList.map((t, i) => ({
    ...t,
    prototype: Object.fromEntries(DIMENSION_IDS.map((d, k) => [d, protos[i][k]])) as DimensionVector,
  }));
}

/** types.json의 "prototype" 줄만 교체해 나머지 서식을 보존한다 */
function writePrototypes(typeList: PersonalityType[]) {
  const source = fs.readFileSync(TYPES_PATH, "utf8");
  let i = 0;
  const updated = source.replace(/"prototype": \{[^}]*\}/g, () => {
    const p = typeList[i++].prototype;
    return `"prototype": { ${DIMENSION_IDS.map((d) => `"${d}": ${p[d]}`).join(", ")} }`;
  });
  if (i !== typeList.length) throw new Error(`prototype 줄 개수(${i})가 유형 수와 다릅니다`);
  fs.writeFileSync(TYPES_PATH, updated);
}

function minPrototypeDistance(typeList: PersonalityType[]): { d: number; pair: string } {
  let best = { d: Infinity, pair: "" };
  for (let i = 0; i < typeList.length; i++) {
    for (let j = i + 1; j < typeList.length; j++) {
      const d = euclideanDistance(typeList[i].prototype, typeList[j].prototype);
      if (d < best.d) best = { d, pair: `${typeList[i].name} ↔ ${typeList[j].name}` };
    }
  }
  return best;
}

// ── 실행 ───────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  let typeList = types;

  if (args.includes("--calibrate")) {
    const before = minPrototypeDistance(typeList);
    typeList = calibrate(typeList);
    writePrototypes(typeList);
    const after = minPrototypeDistance(typeList);
    console.log(`프로토타입 보정 완료 → data/types.json 갱신`);
    console.log(`  최소 거리: ${before.d.toFixed(2)} → ${after.d.toFixed(2)} (${after.pair})\n`);
  }

  const results = {
    normal: distribution(sampleVectors("normal", N, VERIFY_SEEDS.normal), typeList),
    uniform: distribution(sampleVectors("uniform", N, VERIFY_SEEDS.uniform), typeList),
    desirability: distribution(sampleVectors("desirability", N, VERIFY_SEEDS.desirability), typeList),
  };

  const flag = (s: number) => (s < MIN_SHARE || s > MAX_SHARE ? " ⚠" : "");
  const rows = typeList.map((t, i) => {
    const [a, b, c] = (["normal", "uniform", "desirability"] as Scenario[]).map((s) => results[s].shares[i]);
    const norm = Math.hypot(...DIMENSION_IDS.map((d) => t.prototype[d]));
    return `| ${i + 1} | ${t.name} | ${norm.toFixed(2)} | ${a.toFixed(1)}%${flag(a)} | ${b.toFixed(1)}%${flag(b)} | ${c.toFixed(1)}% |`;
  });

  const summary = (["normal", "uniform", "desirability"] as Scenario[]).map((s) => {
    const sh = results[s].shares;
    const min = Math.min(...sh);
    const max = Math.max(...sh);
    const sd = Math.sqrt(sh.reduce((acc, x) => acc + (x - IDEAL_SHARE) ** 2, 0) / sh.length);
    const graded = s !== "desirability";
    const pass = !graded || (min >= MIN_SHARE && max <= MAX_SHARE);
    const verdict = graded ? (pass ? "통과" : "실패") : "참고(판정 제외)";
    return {
      s,
      pass,
      line: `| ${SCENARIO_LABEL[s]} | ${min.toFixed(1)}% | ${max.toFixed(1)}% | ${sd.toFixed(2)}%p | ${results[s].mainMatchMedian}% | ${results[s].hiddenMatchMedian}% | ${verdict} |`,
    };
  });

  const md = [
    "# 유형 분포 시뮬레이션 결과",
    "",
    `> \`npm run simulate\`로 생성됨. 시나리오별 ${N.toLocaleString()}건, 고정 시드(A ${VERIFY_SEEDS.normal}, B ${VERIFY_SEEDS.uniform}, C ${VERIFY_SEEDS.desirability})로 재현 가능.`,
    `> 기준: A·B에서 모든 유형 ${MIN_SHARE}% 이상 ${MAX_SHARE}% 이하 (이상적 비율 ${IDEAL_SHARE.toFixed(2)}%). C는 한계 파악용 참고 시나리오.`,
    "",
    "## 요약",
    "",
    "| 시나리오 | 최소 | 최대 | 이상 비율과의 표준편차 | 메인 일치도 중앙값 | 숨은 닮은꼴 일치도 중앙값 | 판정 |",
    "|---|---|---|---|---|---|---|",
    ...summary.map((x) => x.line),
    "",
    "## 유형별 비율",
    "",
    "| # | 유형 | 프로토타입 크기 | A. 정규분포 | B. 무작위 | C. (참고) 바람직성 편향 |",
    "|---|---|---|---|---|---|",
    ...rows,
    "",
    `프로토타입 간 최소 거리: ${minPrototypeDistance(typeList).d.toFixed(2)} (${minPrototypeDistance(typeList).pair})`,
    "",
  ].join("\n");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, md);
  console.log(md);
  console.log(`→ ${path.relative(ROOT, REPORT_PATH)} 저장`);

  if (!summary.every((x) => x.pass)) {
    console.error("\n✗ 분포 기준을 벗어난 유형이 있습니다. --calibrate로 보정하거나 프로토타입을 조정하세요.");
    process.exit(1);
  }
}

main();
