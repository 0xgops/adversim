import type { ScenarioCase } from "@/types/adversim";

const CASE_HISTORY_KEY = "adversim-case-history";
const CASE_HISTORY_LIMIT = 5;

export type CaseHistoryItem = Pick<
  ScenarioCase,
  "case_id" | "title" | "scenario_family" | "difficulty" | "severity" | "target_user" | "target_host" | "confidence"
> & {
  staged_at: string;
};

function toHistoryItem(caseFile: ScenarioCase): CaseHistoryItem {
  return {
    case_id: caseFile.case_id,
    title: caseFile.title,
    scenario_family: caseFile.scenario_family,
    difficulty: caseFile.difficulty,
    severity: caseFile.severity,
    target_user: caseFile.target_user,
    target_host: caseFile.target_host,
    confidence: caseFile.confidence,
    staged_at: new Date().toISOString()
  };
}

function parseHistory(value: string | null): CaseHistoryItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as CaseHistoryItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.case_id && item?.title) : [];
  } catch {
    return [];
  }
}

export function readCaseHistory() {
  if (typeof window === "undefined") {
    return [];
  }

  return parseHistory(window.localStorage.getItem(CASE_HISTORY_KEY)).slice(0, CASE_HISTORY_LIMIT);
}

export function recordCaseHistory(caseFile: ScenarioCase) {
  if (typeof window === "undefined") {
    return [];
  }

  const nextItem = toHistoryItem(caseFile);
  const existing = parseHistory(window.localStorage.getItem(CASE_HISTORY_KEY)).filter(
    (item) => item.case_id !== caseFile.case_id
  );
  const nextHistory = [nextItem, ...existing].slice(0, CASE_HISTORY_LIMIT);

  window.localStorage.setItem(CASE_HISTORY_KEY, JSON.stringify(nextHistory));
  window.dispatchEvent(new CustomEvent("adversim-case-history", { detail: nextHistory }));

  return nextHistory;
}
