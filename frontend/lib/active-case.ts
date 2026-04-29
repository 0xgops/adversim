import type { ScenarioCase } from "@/types/adversim";

export const ACTIVE_CASE_KEY = "adversim-active-case";
export const LAST_RUN_KEY = "adversim-last-run";
export const ACTIVE_CASE_EVENT = "adversim-active-case";
export const ACTIVE_CASE_CLEARED_EVENT = "adversim-active-case-cleared";
export const ENVIRONMENT_PURGED_EVENT = "adversim-environment-purged";

function isScenarioCase(value: unknown): value is ScenarioCase {
  const candidate = value as Partial<ScenarioCase> | null;

  return Boolean(
    candidate?.case_id &&
      Array.isArray(candidate.telemetry_events) &&
      Array.isArray(candidate.key_evidence_event_ids) &&
      Array.isArray(candidate.decoy_event_ids) &&
      Array.isArray(candidate.chartData?.mappedTactics) &&
      Array.isArray(candidate.chartData?.severityHeat)
  );
}

export function parseStoredActiveCase(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return isScenarioCase(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readActiveCase() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredActiveCase(window.localStorage.getItem(ACTIVE_CASE_KEY));
}

export function clearActiveCaseState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACTIVE_CASE_KEY);
  window.localStorage.removeItem(LAST_RUN_KEY);
  window.dispatchEvent(new CustomEvent(ACTIVE_CASE_CLEARED_EVENT));
  window.dispatchEvent(new CustomEvent(ENVIRONMENT_PURGED_EVENT));
}

export function subscribeToActiveCase(callback: (caseFile: ScenarioCase | null) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function publishCurrentCase() {
    callback(readActiveCase());
  }

  function receiveActiveCase(event: Event) {
    const nextCase = (event as CustomEvent<ScenarioCase>).detail;
    callback(isScenarioCase(nextCase) ? nextCase : readActiveCase());
  }

  function clearActiveCase() {
    callback(null);
  }

  function receiveStorageCase(event: StorageEvent) {
    if (event.key !== ACTIVE_CASE_KEY) {
      return;
    }

    callback(parseStoredActiveCase(event.newValue));
  }

  const frame = window.requestAnimationFrame(publishCurrentCase);
  window.addEventListener(ACTIVE_CASE_EVENT, receiveActiveCase);
  window.addEventListener(ACTIVE_CASE_CLEARED_EVENT, clearActiveCase);
  window.addEventListener(ENVIRONMENT_PURGED_EVENT, clearActiveCase);
  window.addEventListener("storage", receiveStorageCase);

  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener(ACTIVE_CASE_EVENT, receiveActiveCase);
    window.removeEventListener(ACTIVE_CASE_CLEARED_EVENT, clearActiveCase);
    window.removeEventListener(ENVIRONMENT_PURGED_EVENT, clearActiveCase);
    window.removeEventListener("storage", receiveStorageCase);
  };
}
