/**
 * 브라우저 localStorage에 진행 상태만 저장한다 (서버 전송 없음).
 * 사생활 보호 모드 등에서 저장소 접근이 막혀도 테스트는 그대로 동작해야 하므로 모든 접근을 try/catch로 감싼다.
 */
import { isValidResponse } from "./scoring";
import type { Answers } from "./types";

// v2: 54문항으로 개편. 42문항 시절(v1)의 진행 상태는 문항이 달라 이어받지 않는다.
const PROGRESS_KEY = "archetype-test:v2:progress";
const LAST_RESULT_KEY = "archetype-test:v1:last-result";

export interface Progress {
  answers: Answers;
  index: number;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 저장 실패는 무시 (새로고침 시 이어하기만 안 될 뿐)
  }
}

/** 저장된 진행 상태. 현재 문항 목록에 없는 id나 잘못된 값은 버린다. */
export function loadProgress(itemIds: string[]): Progress | null {
  const raw = read(PROGRESS_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const valid = new Set(itemIds);
    const answers: Answers = {};
    for (const [id, value] of Object.entries(parsed.answers ?? {})) {
      if (valid.has(id) && isValidResponse(value)) answers[id] = value;
    }
    if (Object.keys(answers).length === 0) return null;
    const firstUnanswered = itemIds.findIndex((id) => !(id in answers));
    const maxIndex = firstUnanswered === -1 ? itemIds.length - 1 : firstUnanswered;
    const index = Number.isInteger(parsed.index) ? Math.min(Math.max(parsed.index!, 0), maxIndex) : maxIndex;
    return { answers, index };
  } catch {
    return null;
  }
}

export function saveProgress(progress: Progress) {
  write(PROGRESS_KEY, JSON.stringify(progress));
}

export function clearProgress() {
  write(PROGRESS_KEY, null);
}

export function loadLastResult(): string | null {
  return read(LAST_RESULT_KEY);
}

export function saveLastResult(code: string) {
  write(LAST_RESULT_KEY, code);
}
