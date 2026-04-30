"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  History,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  XCircle
} from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useViewMode } from "@/components/ViewModeProvider";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { publishActiveCaseState } from "@/lib/active-case";
import { readCaseHistory, recordCaseHistory } from "@/lib/case-history";
import {
  generateDailyThreatQueue,
  generateQuickStartCase,
  generateScenarioCase,
  gradeEvidenceSelection,
  scenarioDifficulties,
  scenarioFamilies,
  scenarioRandomnessLevels,
  trainingModes
} from "@/lib/scenario-director";
import type {
  CaseDebrief,
  EvidenceEvent,
  ScenarioCase,
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  TrainingMode
} from "@/types/adversim";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`glass-panel soc-precision rounded-[28px] p-5 ${className}`}>{children}</section>;
}

function OptionButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring rounded-[14px] border px-3 py-2 text-left text-xs font-semibold transition ${
        active ? "border-lime/60 bg-lime/10 text-lime shadow-lime" : "border-line bg-black/25 text-zinc-400 hover:border-lime/30 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EvidenceStatus({ event, selected, debrief }: { event: EvidenceEvent; selected: boolean; debrief: CaseDebrief | null }) {
  if (!debrief) {
    return selected ? <span className="technical text-[10px] uppercase tracking-[0.18em] text-lime">selected</span> : null;
  }

  if (event.is_key_evidence && selected) {
    return <span className="technical text-[10px] uppercase tracking-[0.18em] text-lime">correct clue</span>;
  }

  if (event.is_key_evidence && !selected) {
    return <span className="technical text-[10px] uppercase tracking-[0.18em] text-crimson">missed clue</span>;
  }

  if (!event.is_key_evidence && selected) {
    return <span className="technical text-[10px] uppercase tracking-[0.18em] text-orange-300">false positive</span>;
  }

  return <span className="technical text-[10px] uppercase tracking-[0.18em] text-zinc-500">noise</span>;
}

function eventCardTone(event: EvidenceEvent, selected: boolean, debrief: CaseDebrief | null) {
  if (!debrief) {
    return selected ? "border-lime/60 bg-lime/[0.08] shadow-lime" : "border-line bg-black/25 hover:border-lime/30";
  }

  if (event.is_key_evidence && selected) {
    return "border-lime/60 bg-lime/[0.08] shadow-lime";
  }

  if (event.is_key_evidence && !selected) {
    return "border-crimson/50 bg-crimson/[0.08]";
  }

  if (!event.is_key_evidence && selected) {
    return "border-orange-300/45 bg-orange-300/[0.07]";
  }

  return "border-line bg-black/20 opacity-75";
}

const MISSION_BRIEFING_COPY =
  "Filter high-fidelity signals from baseline background noise to reconstruct the attack timeline and identify the adversary's objective.";

function operationalGuidanceForDifficulty(difficulty: ScenarioDifficulty, trainingMode: TrainingMode) {
  if (difficulty === "Expert") {
    return "No hints provided. Severity and source tags are hidden. Trust your training and use the Dashboard Incident Heat chart to prioritize evidence.";
  }

  if (difficulty === "Intermediate") {
    return "Severity badges are hidden. Use the Dashboard Mapped Tactics chart to decide which event types deserve attention.";
  }

  return `Severity badges and ${trainingMode === "Guided" ? "plain-English hints" : "post-investigation hints"} are available. Select the events that support the incident narrative.`;
}

function evidenceHintForDifficulty(event: EvidenceEvent, difficulty: ScenarioDifficulty, trainingMode: TrainingMode, debrief: CaseDebrief | null) {
  if (difficulty === "Expert") {
    return debrief ? "Finding submitted. Review the debrief below for what matched, what was missed, and what was noise." : null;
  }

  if (trainingMode === "Guided" || debrief) {
    return event.plain_english;
  }

  return "Blind investigation: submit your finding to reveal the plain-English mentor hint.";
}

function difficultyBadgeTone(item: ScenarioDifficulty, active: boolean) {
  if (active) {
    return "border-lime/40 bg-lime text-obsidian shadow-lime";
  }

  if (item === "Expert") {
    return "border-crimson/35 bg-crimson/10 text-crimson hover:border-crimson/60";
  }

  if (item === "Intermediate") {
    return "border-orange-300/35 bg-orange-300/10 text-orange-200 hover:border-orange-300/60";
  }

  return "border-line bg-black/25 text-zinc-400 hover:border-lime/30 hover:text-lime";
}
function readStoredActiveCase() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem("adversim-active-case") ?? "null") as ScenarioCase | null;
    return parsed?.chartData?.mappedTactics && parsed?.telemetry_events?.length ? parsed : null;
  } catch {
    return null;
  }
}
function publishActiveCase(caseFile: ScenarioCase) {
  if (typeof window === "undefined") {
    return;
  }

  publishActiveCaseState(caseFile);
  recordCaseHistory(caseFile);
}
type ScenarioDirectorLabProps = {
  quickStart?: boolean;
};

export function ScenarioDirectorLab({ quickStart = false }: ScenarioDirectorLabProps) {
  const { isSocView } = useViewMode();
  const dailyQueue = useMemo(() => generateDailyThreatQueue(), []);
  const isQuickStart = quickStart;
  const [initialCaseState] = useState(() => {
    const storedCase = quickStart ? readStoredActiveCase() : null;
    const caseFile = storedCase ?? (quickStart ? generateQuickStartCase() : dailyQueue[2].case);

    return {
      caseFile,
      shouldShowInitialBuild: quickStart && !storedCase
    };
  });
  const [family, setFamily] = useState<ScenarioFamily>(initialCaseState.caseFile.scenario_family);
  const [difficulty, setDifficulty] = useState<ScenarioDifficulty>(initialCaseState.caseFile.difficulty);
  const [randomness, setRandomness] = useState<ScenarioRandomness>("Medium");
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("Guided");
  const [caseCounter, setCaseCounter] = useState(6);
  const [quickCaseCounter, setQuickCaseCounter] = useState(1);
  const [caseFile, setCaseFile] = useState<ScenarioCase>(initialCaseState.caseFile);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [debrief, setDebrief] = useState<CaseDebrief | null>(null);
  const [isBuildingCase, setIsBuildingCase] = useState(initialCaseState.shouldShowInitialBuild);
  const [buildProgress, setBuildProgress] = useState(initialCaseState.shouldShowInitialBuild ? 0 : 1);
  const [caseHistory, setCaseHistory] = useState(() => readCaseHistory());
  const [expertMode, setExpertMode] = useState(false);
  const buildIntervalRef = useRef<number | null>(null);
  const buildTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!initialCaseState.shouldShowInitialBuild) {
      return;
    }

    const progressTimer = window.setInterval(() => {
      setBuildProgress((current) => Math.min(1, current + 0.08));
    }, 90);

    const doneTimer = window.setTimeout(() => {
      window.clearInterval(progressTimer);
      setBuildProgress(1);
      setIsBuildingCase(false);
    }, 1500);

    return () => {
      window.clearInterval(progressTimer);
      window.clearTimeout(doneTimer);
    };
  }, [initialCaseState.shouldShowInitialBuild]);

  useEffect(() => {
    return () => {
      if (buildIntervalRef.current !== null) {
        window.clearInterval(buildIntervalRef.current);
      }

      if (buildTimeoutRef.current !== null) {
        window.clearTimeout(buildTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function syncCaseHistory(event: Event) {
      setCaseHistory((event as CustomEvent<ReturnType<typeof readCaseHistory>>).detail ?? readCaseHistory());
    }

    const frame = window.requestAnimationFrame(() => setCaseHistory(readCaseHistory()));
    window.addEventListener("adversim-case-history", syncCaseHistory);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("adversim-case-history", syncCaseHistory);
    };
  }, []);

  useEffect(() => {
    if (!isQuickStart) {
      return;
    }

    publishActiveCase(initialCaseState.caseFile);
  }, [initialCaseState.caseFile, isQuickStart]);

  const selectedSet = useMemo(() => new Set(selectedEventIds), [selectedEventIds]);
  const showSeverityBadges = caseFile.difficulty === "Beginner";
  const canRevealSourceTags = expertMode && caseFile.difficulty !== "Expert";
  const keyCount = caseFile.key_evidence_event_ids.length;
  const decoyCount = caseFile.decoy_event_ids.length;

  function loadCase(nextCase: ScenarioCase, { commit = false }: { commit?: boolean } = {}) {
    setCaseFile(nextCase);
    setFamily(nextCase.scenario_family);
    setDifficulty(nextCase.difficulty);
    setSelectedEventIds([]);
    setDebrief(null);

    if (commit) {
      publishActiveCase(nextCase);
    }
  }

  function clearBuildAnimation() {
    if (buildIntervalRef.current !== null) {
      window.clearInterval(buildIntervalRef.current);
      buildIntervalRef.current = null;
    }

    if (buildTimeoutRef.current !== null) {
      window.clearTimeout(buildTimeoutRef.current);
      buildTimeoutRef.current = null;
    }
  }

  function stageCaseWithLoading(nextCase: ScenarioCase, { commit = false }: { commit?: boolean } = {}) {
    clearBuildAnimation();
    setSelectedEventIds([]);
    setDebrief(null);
    setBuildProgress(0);
    setIsBuildingCase(true);

    buildIntervalRef.current = window.setInterval(() => {
      setBuildProgress((current) => Math.min(1, current + 0.08));
    }, 90);

    buildTimeoutRef.current = window.setTimeout(() => {
      clearBuildAnimation();
      loadCase(nextCase, { commit });
      setBuildProgress(1);
      setIsBuildingCase(false);
    }, 1500);
  }

  function generateNewCase() {
    const nextCounter = caseCounter + 1;
    const nextCase = generateScenarioCase({
      family,
      difficulty,
      randomness,
      trainingMode,
      seed: `${Date.now()}:${Math.random()}`,
      caseNumber: nextCounter
    });

    setCaseCounter(nextCounter);
    stageCaseWithLoading(nextCase, { commit: true });
  }

  function rollQuickStartCase() {
    const nextCounter = quickCaseCounter + 1;
    const nextCase = generateQuickStartCase({ caseNumber: nextCounter, difficulty });

    setQuickCaseCounter(nextCounter);
    stageCaseWithLoading(nextCase, { commit: true });
  }

  function toggleEvent(eventId: string) {
    if (debrief) {
      return;
    }

    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  }

  function submitFinding() {
    setDebrief(gradeEvidenceSelection(caseFile, selectedEventIds));
  }

  if (isBuildingCase) {
    const progressPercent = Math.round(buildProgress * 100);
    const loadingTitle = isQuickStart ? "Analyzing Synthetic Telemetry..." : "Building Custom Investigation...";
    const loadingDescription = isQuickStart
      ? "Selecting a scenario family, sampling clue evidence, injecting decoys, and normalizing the investigation timeline."
      : `Applying ${family}, ${difficulty}, ${randomness}, and ${trainingMode} settings before the evidence board refreshes.`;

    return (
      <div className="grid min-h-[58vh] place-items-center">
        <motion.section
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="guide-glass w-full max-w-3xl overflow-hidden rounded-[32px] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="technical text-xs uppercase tracking-[0.28em] text-lime">{isQuickStart ? "Scenario Director" : "Custom Lab Builder"}</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-5xl">{loadingTitle}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">{loadingDescription}</p>
            </div>
            <div className="technical rounded-full border border-lime/25 bg-lime/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-lime shadow-lime">
              {progressPercent}%
            </div>
          </div>

          <div className="mt-7 h-3 overflow-hidden rounded-full border border-line bg-black/40">
            <motion.div
              className="h-full rounded-full bg-lime shadow-lime"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {["Scenario", "Clues", "Decoys", "Timeline"].map((step) => (
              <div key={step} className="rounded-[18px] border border-line bg-black/25 p-4">
                <p className="technical text-[10px] uppercase tracking-[0.18em] text-zinc-500">building</p>
                <p className="mt-2 text-sm font-semibold text-ink">{step}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isSocView ? "soc-dense-stack" : ""}`}>
      {!isQuickStart ? (
        <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className={`guide-glass relative overflow-hidden rounded-[32px] ${isSocView ? "p-4" : "p-6 sm:p-8"}`}
      >
        <div className={`relative z-10 grid lg:items-end ${isSocView ? "gap-4 lg:grid-cols-[1fr_300px]" : "gap-6 lg:grid-cols-[1fr_360px]"}`}>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="technical rounded-full border border-lime/35 bg-lime/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-lime shadow-lime">
                Cybersecurity
              </span>
              <span className="technical text-xs uppercase tracking-[0.32em] text-lime">Custom Lab Builder</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-normal text-ink sm:text-6xl">
              Build a custom case. Investigate the evidence. Get graded.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-300">
              Custom Lab Builder keeps the full Scenario Director controls for power users. Tune the scenario, difficulty, randomness, and training mode before launching a safe synthetic investigation.
            </p>
          </div>

          <div className={`rounded-[24px] border border-line bg-black/30 ${isSocView ? "p-4" : "p-5"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="technical text-xs uppercase tracking-[0.24em] text-zinc-500">Training loop</p>
              <ViewModeToggle />
            </div>
            <div className="mt-4 space-y-3">
              {["Generate Case", "Select Evidence", "Submit Finding", "Read AI-style Debrief"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-[16px] border border-line bg-white/[0.035] px-3 py-3">
                  <span className="technical text-[11px] text-lime">0{index + 1}</span>
                  <span className="text-sm text-zinc-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </motion.section>
      ) : null}

      <section className={isQuickStart ? `grid ${isSocView ? "gap-3" : "gap-5"}` : `grid ${isSocView ? "gap-3 xl:grid-cols-[280px_1fr]" : "gap-5 xl:grid-cols-[330px_1fr]"}`}>
        {!isQuickStart ? (
          <div className={`space-y-5 ${isSocView ? "soc-dense-stack" : ""}`}>
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-lime/25 bg-lime/10 text-lime shadow-lime">
                <BrainCircuit aria-hidden size={19} />
              </div>
              <div>
                <p className="text-base font-semibold text-ink">Custom Lab Builder</p>
                <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">template-safe randomness</p>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="technical mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Scenario family</p>
                <div className="grid gap-2">
                  {scenarioFamilies.map((item) => (
                    <OptionButton key={item} active={family === item} onClick={() => setFamily(item)}>
                      {item}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <p className="technical mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Difficulty</p>
                <div className="grid grid-cols-2 gap-2">
                  {scenarioDifficulties.map((item) => (
                    <OptionButton key={item} active={difficulty === item} onClick={() => setDifficulty(item)}>
                      {item}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <p className="technical mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Randomness</p>
                <div className="grid gap-2">
                  {scenarioRandomnessLevels.map((item) => (
                    <OptionButton key={item} active={randomness === item} onClick={() => setRandomness(item)}>
                      {item}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <div>
                <p className="technical mb-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Training mode</p>
                <div className="grid gap-2">
                  {trainingModes.map((item) => (
                    <OptionButton key={item} active={trainingMode === item} onClick={() => setTrainingMode(item)}>
                      {item}
                    </OptionButton>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={generateNewCase}
                className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                <RefreshCw aria-hidden size={17} />
                Start Custom Investigation
              </button>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="technical text-xs uppercase tracking-[0.24em] text-lime">Case History</p>
                <h2 className="mt-2 text-lg font-semibold text-ink">Last 5 investigations</h2>
              </div>
              <History aria-hidden size={19} className="text-lime" />
            </div>
            <div className="mt-4 space-y-3">
              {caseHistory.length ? caseHistory.map((item) => (
                <div key={`${item.case_id}-${item.staged_at}`} className="rounded-[18px] border border-line bg-black/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="technical text-[10px] uppercase tracking-[0.18em] text-lime">
                      {new Date(item.staged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <SeverityBadge severity={item.severity} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{item.scenario_family} / {item.target_host}</p>
                </div>
              )) : (
                <div className="rounded-[18px] border border-line bg-black/25 p-3">
                  <p className="text-sm leading-5 text-zinc-400">Stage a case to populate the investigation history.</p>
                </div>
              )}
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="technical text-xs uppercase tracking-[0.24em] text-lime">Daily Threat Queue</p>
                <h2 className="mt-2 text-lg font-semibold text-ink">Synthetic SOC shift</h2>
              </div>
              <Clock3 aria-hidden size={19} className="text-lime" />
            </div>
            <div className="mt-4 space-y-3">
              {dailyQueue.map((item) => {
                const active = item.case.case_id === caseFile.case_id;
                return (
                  <button
                    key={item.case.case_id}
                    type="button"
                    onClick={() => loadCase(item.case)}
                    className={`focus-ring w-full rounded-[18px] border p-3 text-left transition ${
                      active ? "border-lime/60 bg-lime/[0.08] shadow-lime" : "border-line bg-black/25 hover:border-lime/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="technical text-[10px] uppercase tracking-[0.18em] text-lime">{item.time}</span>
                      <SeverityBadge severity={item.case.severity} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink">{item.case.title}</p>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{item.case.scenario_family}</p>
                  </button>
                );
              })}
            </div>
          </GlassCard>
          </div>
        ) : null}

        <div className={`space-y-5 ${isSocView ? "soc-dense-stack" : ""}`}>
          <GlassCard className={isQuickStart ? (isSocView ? "" : "guide-glass") : ""}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <p className="technical text-xs uppercase tracking-[0.24em] text-lime">
                  {isQuickStart ? "60-second investigation" : "Custom Lab Builder"}
                </p>
                <h1 className={`${isSocView ? "mt-1 text-2xl sm:text-3xl" : "mt-2 text-3xl sm:text-4xl"} font-semibold text-ink`}>Mission Briefing</h1>
                <p className={`${isSocView ? "soc-terminal-copy mt-2" : "mt-3 text-base leading-7"} text-zinc-200`}>{MISSION_BRIEFING_COPY}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="technical rounded-full border border-line bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                    {caseFile.case_id}
                  </span>
                  <span className="technical rounded-full border border-lime/25 bg-lime/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-lime">
                    {caseFile.title}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {isQuickStart ? (
                  <div className="flex h-9 items-center gap-1 rounded-[14px] border border-line bg-black/30 p-1" aria-label="Difficulty selector">
                    {scenarioDifficulties.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDifficulty(item)}
                        className={`focus-ring technical h-7 rounded-[10px] px-2 text-[9px] uppercase tracking-[0.12em] transition ${difficultyBadgeTone(item, difficulty === item)}`}
                        aria-pressed={difficulty === item}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
                {isQuickStart ? (
                  <div className="group/stage relative flex-none">
                    <button
                      type="button"
                      onClick={rollQuickStartCase}
                      className="focus-ring inline-flex h-9 w-[218px] items-center justify-center gap-2 whitespace-nowrap rounded-[14px] border border-lime/30 bg-lime/10 px-3 text-xs font-bold text-lime shadow-lime transition hover:bg-lime hover:text-obsidian"
                      aria-label="Stage new incident"
                    >
                      <RefreshCw aria-hidden size={14} />
                      <span>Stage New Incident</span>
                    </button>
                    <div className="pointer-events-none absolute right-0 top-11 z-20 w-max translate-y-1 rounded-[12px] border border-line bg-panel/95 px-3 py-2 opacity-0 shadow-lime backdrop-blur-[20px] transition group-hover/stage:translate-y-0 group-hover/stage:opacity-100 group-focus-within/stage:translate-y-0 group-focus-within/stage:opacity-100">
                      <p className="technical text-[9px] uppercase tracking-[0.18em] text-lime">Procedurally generating TTPs</p>
                    </div>
                  </div>
                ) : null}
                {showSeverityBadges ? (
                  <SeverityBadge severity={caseFile.severity} />
                ) : (
                  <span className="technical inline-flex h-7 items-center rounded-md border border-line bg-black/25 px-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    Severity concealed
                  </span>
                )}
                <span className="technical inline-flex h-7 items-center rounded-md border border-line bg-white/5 px-2 text-xs uppercase tracking-[0.16em] text-zinc-300">
                  {caseFile.difficulty}
                </span>
              </div>
            </div>

            <div className={`grid md:grid-cols-4 ${isSocView ? "mt-3 gap-2" : "mt-5 gap-3"}`}>
              {[
                ["Target user", caseFile.target_user],
                ["Target host", caseFile.target_host],
                ["Profile", caseFile.attacker_profile],
                ["Confidence", `${caseFile.confidence}%`]
              ].map(([label, value]) => (
                <div key={label} className={`soc-compact-card rounded-[18px] border border-line bg-black/25 ${isSocView ? "p-3" : "p-4"}`}>
                  <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                  <p className="technical mt-2 text-sm leading-5 text-zinc-200">{value}</p>
                </div>
              ))}
            </div>

            <div className={`soc-compact-card rounded-[18px] border border-line bg-white/[0.035] ${isSocView ? "mt-3 p-3" : "mt-5 p-4"}`}>
              <div className="flex items-center gap-2 text-lime">
                <Eye aria-hidden size={16} />
                <p className="technical text-xs uppercase tracking-[0.22em]">Operational guidance</p>
              </div>
              <p className={`${isSocView ? "soc-terminal-copy mt-2" : "mt-2 text-sm leading-6"} text-zinc-300`}>
                {operationalGuidanceForDifficulty(caseFile.difficulty, trainingMode)}
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="technical text-xs uppercase tracking-[0.24em] text-lime">Evidence Board</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Select suspicious events</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpertMode((current) => !current)}
                  disabled={caseFile.difficulty === "Expert"}
                  className={`focus-ring technical h-8 rounded-[12px] border px-3 text-[10px] uppercase tracking-[0.16em] transition ${
                    caseFile.difficulty === "Expert"
                      ? "cursor-not-allowed border-line bg-black/20 text-zinc-600"
                      : expertMode
                        ? "border-lime/40 bg-lime/10 text-lime shadow-lime"
                        : "border-line bg-black/25 text-zinc-400 hover:border-lime/30 hover:text-ink"
                  }`}
                  aria-pressed={expertMode}
                >
                  {caseFile.difficulty === "Expert" ? "Source Tags Locked" : `Expert Mode ${expertMode ? "On" : "Off"}`}
                </button>
                <div className="technical rounded-full border border-line bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                  {keyCount} clues / {decoyCount} decoys
                </div>
              </div>
            </div>

            <div className={`grid ${isSocView ? "mt-3 gap-2 xl:grid-cols-3" : "mt-5 gap-3 lg:grid-cols-2"}`}>
              {caseFile.telemetry_events.map((event, index) => {
                const selected = selectedSet.has(event.event_id);
                const evidenceHint = evidenceHintForDifficulty(event, caseFile.difficulty, trainingMode, debrief);
                return (
                  <motion.button
                    key={event.event_id}
                    type="button"
                    onClick={() => toggleEvent(event.event_id)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, delay: index * 0.03 }}
                    className={`focus-ring soc-compact-card rounded-[22px] border text-left transition ${isSocView ? "p-3" : "p-4"} ${eventCardTone(event, selected, debrief)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="technical text-[10px] uppercase tracking-[0.2em] text-lime">{event.timestamp} / {event.source}</p>
                        <h3 className={`${isSocView ? "soc-terminal-copy mt-2 font-semibold" : "mt-3 text-base font-semibold"} text-ink`}>{event.summary}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {showSeverityBadges ? <SeverityBadge severity={event.severity} /> : null}
                        <EvidenceStatus event={event} selected={selected} debrief={debrief} />
                      </div>
                    </div>
                    {evidenceHint ? (
                      <p className={`${isSocView ? "soc-terminal-copy mt-2" : "mt-3 text-sm leading-6"} text-zinc-400`}>{evidenceHint}</p>
                    ) : null}
                    <AnimatePresence initial={false}>
                      {canRevealSourceTags ? (
                        <motion.div
                          className="mt-4 flex flex-wrap gap-2"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          {event.source_ref ? (
                            <span className="technical rounded-full border border-lime/25 bg-lime/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-lime">
                              Source: {event.source_ref}
                            </span>
                          ) : null}
                          {event.tags.map((tag) => (
                            <span key={tag} className="technical rounded-full border border-line bg-black/30 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                              {tag}
                            </span>
                          ))}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            <div className={`soc-compact-card flex flex-wrap items-center justify-between rounded-[20px] border border-line bg-black/30 ${isSocView ? "mt-3 gap-2 p-3" : "mt-5 gap-3 p-4"}`}>
              <p className={`${isSocView ? "soc-terminal-copy" : "text-sm leading-6"} text-zinc-400`}>
                Selected <span className="text-lime">{selectedEventIds.length}</span> events. Submit when your finding tells a clear story.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventIds([]);
                    setDebrief(null);
                  }}
                  className="focus-ring h-10 rounded-[14px] border border-line bg-white/5 px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={selectedEventIds.length === 0 || Boolean(debrief)}
                  onClick={submitFinding}
                  className="focus-ring flex h-10 items-center gap-2 rounded-[14px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                >
                  <ClipboardCheck aria-hidden size={16} />
                  Submit Finding
                </button>
              </div>
            </div>
          </GlassCard>

          {debrief ? (
            <GlassCard className="guide-glass">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-lime">
                    <GraduationCap aria-hidden size={18} />
                    <p className="technical text-xs uppercase tracking-[0.24em]">AI-style mentor debrief</p>
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold text-ink">{debrief.outcome_label}</h2>
                </div>
                <div className="rounded-[22px] border border-lime/30 bg-lime/10 px-5 py-3 text-center shadow-lime">
                  <p className="technical text-[10px] uppercase tracking-[0.2em] text-lime">Analyst score</p>
                  <p className="mt-1 text-4xl font-semibold text-ink">{debrief.analyst_score}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-zinc-300">{debrief.severity_explanation}</p>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[20px] border border-lime/25 bg-lime/[0.06] p-4">
                  <div className="flex items-center gap-2 text-lime">
                    <CheckCircle2 aria-hidden size={16} />
                    <p className="technical text-[10px] uppercase tracking-[0.2em]">Correct</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-zinc-300">
                    {debrief.correctly_identified.length ? debrief.correctly_identified.map((event) => <li key={event.event_id}>{event.summary}</li>) : <li>No key clues selected.</li>}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-crimson/25 bg-crimson/[0.06] p-4">
                  <div className="flex items-center gap-2 text-crimson">
                    <XCircle aria-hidden size={16} />
                    <p className="technical text-[10px] uppercase tracking-[0.2em]">Missed</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-zinc-300">
                    {debrief.missed_clues.length ? debrief.missed_clues.map((event) => <li key={event.event_id}>{event.summary}</li>) : <li>No missed key clues.</li>}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-orange-300/25 bg-orange-300/[0.06] p-4">
                  <div className="flex items-center gap-2 text-orange-300">
                    <ShieldAlert aria-hidden size={16} />
                    <p className="technical text-[10px] uppercase tracking-[0.2em]">False positives</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-zinc-300">
                    {debrief.false_positives.length ? debrief.false_positives.map((event) => <li key={event.event_id}>{event.summary}</li>) : <li>No decoys selected.</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[20px] border border-line bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-lime">
                    <Target aria-hidden size={16} />
                    <p className="technical text-[10px] uppercase tracking-[0.2em]">Expected findings</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-zinc-300">
                    {caseFile.expected_findings.map((finding) => <li key={finding}>{finding}</li>)}
                  </ul>
                </div>
                <div className="rounded-[20px] border border-line bg-black/25 p-4">
                  <div className="flex items-center gap-2 text-lime">
                    <FileText aria-hidden size={16} />
                    <p className="technical text-[10px] uppercase tracking-[0.2em]">Recommended response</p>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm leading-5 text-zinc-300">
                    {caseFile.recommended_response.map((response) => <li key={response}>{response}</li>)}
                  </ul>
                </div>
              </div>

              <div className="mt-5 rounded-[20px] border border-lime/25 bg-lime/[0.06] p-4">
                <div className="flex items-center gap-2 text-lime">
                  <Sparkles aria-hidden size={16} />
                  <p className="technical text-[10px] uppercase tracking-[0.2em]">Prevention lessons</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {debrief.prevention_guidance.map((lesson) => (
                    <span key={lesson} className="rounded-full border border-lime/25 bg-black/25 px-3 py-1.5 text-xs text-zinc-300">
                      {lesson}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          ) : null}
        </div>
      </section>
    </div>
  );
}

