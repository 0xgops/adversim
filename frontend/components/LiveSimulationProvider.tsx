"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  ACTIVE_CASE_CLEARED_EVENT,
  ACTIVE_CASE_EVENT,
  LAST_RUN_KEY,
  clearActiveCaseState,
  publishActiveCaseState,
  readActiveCase
} from "@/lib/active-case";
import { recordCaseHistory } from "@/lib/case-history";
import type { CaseChartData, CaseDebrief, EvidenceEvent, ScenarioCase } from "@/types/adversim";

const tacticLabels = ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"] as const;
const severityLabels = ["Low", "Medium", "High", "Critical"] as const;

type ActiveStream = {
  baseCase: ScenarioCase;
  events: EvidenceEvent[];
  streamedEvents: EvidenceEvent[];
  cursor: number;
  startedAt: number;
  durationMs: number;
  stageCount: number;
};

type LiveSimulationOptions = {
  durationMs?: number;
  cadenceMs?: number;
  stageCount?: number;
};

type LiveSimulationContextValue = {
  currentCase: ScenarioCase | null;
  streamedEvents: EvidenceEvent[];
  isStreaming: boolean;
  progress: number;
  activeStageIndex: number;
  completed: boolean;
  selectedEvidenceEventIds: string[];
  setSelectedEvidenceEventIds: Dispatch<SetStateAction<string[]>>;
  investigationDebrief: CaseDebrief | null;
  setInvestigationDebrief: Dispatch<SetStateAction<CaseDebrief | null>>;
  clearInvestigationProgress: () => void;
  startSimulation: (caseFile: ScenarioCase, options?: LiveSimulationOptions) => void;
  purgeEnvironment: () => void;
};

const LiveSimulationContext = createContext<LiveSimulationContextValue | null>(null);

function formatStreamClock(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function tacticIndexesForEvent(event: EvidenceEvent) {
  const tags = new Set(event.tags);
  const indexes = new Set<number>();

  if (tags.has("credential-access") || tags.has("identity") || tags.has("cloud") || tags.has("phishing") || tags.has("email")) indexes.add(0);
  if (tags.has("execution") || tags.has("script") || tags.has("process") || tags.has("edr") || tags.has("staging") || tags.has("impact-prevention") || tags.has("ci") || tags.has("application")) indexes.add(1);
  if (tags.has("privilege") || tags.has("privilege-review") || tags.has("remote-admin") || tags.has("repository")) indexes.add(2);
  if (tags.has("discovery") || tags.has("fileshare") || tags.has("collection") || tags.has("baseline") || tags.has("east-west") || tags.has("lateral-movement") || tags.has("correlation") || tags.has("file-change") || tags.has("api") || tags.has("supply-chain")) indexes.add(3);
  if (tags.has("exfiltration") || tags.has("egress") || tags.has("sharing") || tags.has("network") || tags.has("dlp") || tags.has("saas") || tags.has("post-login") || tags.has("waf")) indexes.add(4);

  return indexes.size ? Array.from(indexes) : [3];
}

function buildVisibleChartData(events: EvidenceEvent[]): CaseChartData {
  const mappedTactics = tacticLabels.map(() => 0);
  const severityHeat = severityLabels.map(() => 0);

  for (const event of events.filter((item) => item.is_key_evidence)) {
    for (const index of tacticIndexesForEvent(event)) {
      mappedTactics[index] += 1;
    }

    const severityIndex = severityLabels.indexOf(event.severity);

    if (severityIndex >= 0) {
      severityHeat[severityIndex] += 1;
    }
  }

  return { mappedTactics, severityHeat };
}

function confidenceForVisibleCase(baseCase: ScenarioCase, events: EvidenceEvent[]) {
  if (!events.length) {
    return 0;
  }

  const keyCount = events.filter((event) => event.is_key_evidence).length;
  return Math.min(baseCase.confidence, 42 + events.length * 5 + keyCount * 7);
}

function makeVisibleCase(baseCase: ScenarioCase, events: EvidenceEvent[], complete = false): ScenarioCase {
  const orderedEvents = [...events];

  return {
    ...baseCase,
    confidence: complete ? baseCase.confidence : confidenceForVisibleCase(baseCase, orderedEvents),
    telemetry_events: orderedEvents,
    key_evidence_event_ids: orderedEvents.filter((event) => event.is_key_evidence).map((event) => event.event_id),
    decoy_event_ids: orderedEvents.filter((event) => !event.is_key_evidence).map((event) => event.event_id),
    chartData: buildVisibleChartData(orderedEvents)
  };
}

function stampLiveEvent(event: EvidenceEvent): EvidenceEvent {
  return {
    ...event,
    timestamp: formatStreamClock(new Date())
  };
}

function readCompletedState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(LAST_RUN_KEY) === "complete";
}

export function LiveSimulationProvider({ children }: { children: ReactNode }) {
  const [initialCase] = useState(readActiveCase);
  const [currentCase, setCurrentCase] = useState<ScenarioCase | null>(initialCase);
  const [streamedEvents, setStreamedEvents] = useState<EvidenceEvent[]>(initialCase?.telemetry_events ?? []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [progress, setProgress] = useState(() => (initialCase?.telemetry_events.length ? 100 : 0));
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [completed, setCompleted] = useState(readCompletedState);
  const [selectedEvidenceEventIds, setSelectedEvidenceEventIds] = useState<string[]>([]);
  const [investigationDebrief, setInvestigationDebrief] = useState<CaseDebrief | null>(null);
  const eventIntervalRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<ActiveStream | null>(null);
  const investigationCaseIdRef = useRef<string | null>(initialCase?.case_id ?? null);

  const clearTimers = useCallback(() => {
    if (eventIntervalRef.current !== null) {
      window.clearInterval(eventIntervalRef.current);
      eventIntervalRef.current = null;
    }

    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const clearInvestigationProgress = useCallback(() => {
    setSelectedEvidenceEventIds([]);
    setInvestigationDebrief(null);
  }, []);

  const publishVisibleCase = useCallback((caseFile: ScenarioCase, complete = false) => {
    setCurrentCase(caseFile);
    setStreamedEvents(caseFile.telemetry_events);
    publishActiveCaseState(caseFile, { complete });
  }, []);

  const emitNextEvent = useCallback(() => {
    const stream = streamRef.current;

    if (!stream || stream.cursor >= stream.events.length) {
      return null;
    }

    const nextEvent = stampLiveEvent(stream.events[stream.cursor]);
    stream.cursor += 1;
    stream.streamedEvents = [nextEvent, ...stream.streamedEvents];

    const visibleCase = makeVisibleCase(stream.baseCase, stream.streamedEvents);
    publishVisibleCase(visibleCase);

    return visibleCase;
  }, [publishVisibleCase]);

  const finishStream = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) {
      return;
    }

    while (stream.cursor < stream.events.length) {
      const nextEvent = stampLiveEvent(stream.events[stream.cursor]);
      stream.cursor += 1;
      stream.streamedEvents = [nextEvent, ...stream.streamedEvents];
    }

    const finalCase = makeVisibleCase(stream.baseCase, stream.streamedEvents, true);

    clearTimers();
    streamRef.current = null;
    setProgress(100);
    setActiveStageIndex(Math.max(0, stream.stageCount - 1));
    setIsStreaming(false);
    setCompleted(true);
    publishVisibleCase(finalCase, true);
    recordCaseHistory(finalCase);
  }, [clearTimers, publishVisibleCase]);

  const startSimulation = useCallback(
    (caseFile: ScenarioCase, options: LiveSimulationOptions = {}) => {
      const totalEvents = Math.max(1, caseFile.telemetry_events.length);
      const durationMs = Math.max(options.durationMs ?? 60_000, totalEvents * 1_000);
      const cadenceMs = options.cadenceMs ?? Math.max(1_000, Math.floor(durationMs / totalEvents));
      const stageCount = Math.max(1, options.stageCount ?? caseFile.chartData.mappedTactics.length);
      const emptyCase = makeVisibleCase(caseFile, []);

      clearTimers();
      streamRef.current = {
        baseCase: caseFile,
        events: caseFile.telemetry_events,
        streamedEvents: [],
        cursor: 0,
        startedAt: window.performance.now(),
        durationMs,
        stageCount
      };

      setProgress(0);
      setActiveStageIndex(0);
      setIsStreaming(true);
      setCompleted(false);
      clearInvestigationProgress();
      publishVisibleCase(emptyCase);
      emitNextEvent();

      eventIntervalRef.current = window.setInterval(() => {
        emitNextEvent();
      }, cadenceMs);

      progressIntervalRef.current = window.setInterval(() => {
        const stream = streamRef.current;

        if (!stream) {
          return;
        }

        const elapsed = window.performance.now() - stream.startedAt;
        const nextProgress = Math.min(100, Math.round((elapsed / stream.durationMs) * 100));
        const nextStageIndex = Math.min(stream.stageCount - 1, Math.floor((nextProgress / 100) * stream.stageCount));

        setProgress(nextProgress);
        setActiveStageIndex(nextStageIndex);

        if (elapsed >= stream.durationMs) {
          finishStream();
        }
      }, 250);
    },
    [clearInvestigationProgress, clearTimers, emitNextEvent, finishStream, publishVisibleCase]
  );

  const purgeEnvironment = useCallback(() => {
    clearTimers();
    streamRef.current = null;
    setCurrentCase(null);
    setStreamedEvents([]);
    setIsStreaming(false);
    setProgress(0);
    setActiveStageIndex(0);
    setCompleted(false);
    clearInvestigationProgress();
    clearActiveCaseState();
  }, [clearInvestigationProgress, clearTimers]);

  useEffect(() => {
    function receiveActiveCase(event: Event) {
      if (streamRef.current) {
        return;
      }

      const nextCase = (event as CustomEvent<ScenarioCase>).detail;
      setCurrentCase(nextCase);
      setStreamedEvents(nextCase?.telemetry_events ?? []);
      setProgress(nextCase?.telemetry_events.length ? 100 : 0);
      setCompleted(readCompletedState());
    }

    function clearActiveCase() {
      clearTimers();
      streamRef.current = null;
      setCurrentCase(null);
      setStreamedEvents([]);
      setIsStreaming(false);
      setProgress(0);
      setActiveStageIndex(0);
      setCompleted(false);
      clearInvestigationProgress();
    }

    window.addEventListener(ACTIVE_CASE_EVENT, receiveActiveCase);
    window.addEventListener(ACTIVE_CASE_CLEARED_EVENT, clearActiveCase);

    return () => {
      window.removeEventListener(ACTIVE_CASE_EVENT, receiveActiveCase);
      window.removeEventListener(ACTIVE_CASE_CLEARED_EVENT, clearActiveCase);
      clearTimers();
    };
  }, [clearInvestigationProgress, clearTimers]);

  useEffect(() => {
    const nextCaseId = currentCase?.case_id ?? null;

    if (investigationCaseIdRef.current === nextCaseId) {
      return;
    }

    investigationCaseIdRef.current = nextCaseId;
    clearInvestigationProgress();
  }, [clearInvestigationProgress, currentCase?.case_id]);

  const value = useMemo(
    () => ({
      currentCase,
      streamedEvents,
      isStreaming,
      progress,
      activeStageIndex,
      completed,
      selectedEvidenceEventIds,
      setSelectedEvidenceEventIds,
      investigationDebrief,
      setInvestigationDebrief,
      clearInvestigationProgress,
      startSimulation,
      purgeEnvironment
    }),
    [
      activeStageIndex,
      clearInvestigationProgress,
      completed,
      currentCase,
      investigationDebrief,
      isStreaming,
      progress,
      purgeEnvironment,
      selectedEvidenceEventIds,
      startSimulation,
      streamedEvents
    ]
  );

  return <LiveSimulationContext.Provider value={value}>{children}</LiveSimulationContext.Provider>;
}

export function useLiveSimulation() {
  const context = useContext(LiveSimulationContext);

  if (!context) {
    throw new Error("useLiveSimulation must be used inside LiveSimulationProvider");
  }

  return context;
}
