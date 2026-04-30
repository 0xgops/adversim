"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Gauge,
  GraduationCap,
  History,
  Play,
  Radar,
  RefreshCw,
  Route,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useLiveSimulation } from "@/components/LiveSimulationProvider";
import { useViewMode } from "@/components/ViewModeProvider";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { getLatestSimulation } from "@/lib/api";
import { LAST_RUN_KEY } from "@/lib/active-case";
import { clearCaseHistory, readCaseHistory } from "@/lib/case-history";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { ScenarioCase, SimulationResult } from "@/types/adversim";
import type { LucideIcon } from "lucide-react";

const severityColors: Record<string, string> = {
  High: "#ff8a3d",
  Critical: "#ff2d55",
  Medium: "#dfff00",
  Low: "#60a5fa",
  Ready: "#dfff00",
  Idle: "#2a2a2a"
};

const tacticLabels = ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"];
const severityLabels = ["Low", "Medium", "High", "Critical"];

type HandoffItem = {
  label: string;
  href?: string;
  ariaLabel?: string;
};

const replayHandoffItems: ReadonlyArray<HandoffItem> = [
  { label: "Telemetry replay captured", href: "/telemetry", ariaLabel: "Open telemetry replay" },
  { label: "Detections queued", href: "/detections", ariaLabel: "Open detections" },
  { label: "Timeline ready to inspect", href: "/timeline", ariaLabel: "Open timeline" }
];

const activeInvestigationHandoffItems: ReadonlyArray<HandoffItem> = [
  { label: "Review dashboard heat" },
  { label: "Resume the evidence board" },
  { label: "Submit your finding" }
];

const idleHandoffItems: ReadonlyArray<HandoffItem> = [
  { label: "Start the replay" },
  { label: "Watch logs appear" },
  { label: "Ask AI what it means" }
];


function parseStoredActiveCase(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as ScenarioCase;
    return parsed?.chartData?.mappedTactics && parsed?.chartData?.severityHeat ? parsed : null;
  } catch {
    return null;
  }
}

function BentoCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`glass-panel soc-precision rounded-[24px] p-5 ${className}`}>{children}</section>;
}

function getInitialDashboardCase() {
  if (typeof window === "undefined") {
    return null;
  }

  return parseStoredActiveCase(window.localStorage.getItem("adversim-active-case"));
}
function getInitialRunState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("adversim-last-run") === "complete";
}

function getInitialActiveInvestigationState() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(parseStoredActiveCase(window.localStorage.getItem("adversim-active-case")));
}

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);
  const [chartsReady, setChartsReady] = useState(false);
  const [metricProgress, setMetricProgress] = useState(0);
  const [hasCompletedRun, setHasCompletedRun] = useState(getInitialRunState);
  const [activeMetricInfo, setActiveMetricInfo] = useState<string | null>(null);
  const { isSocView } = useViewMode();
  const { completed: streamCompleted, purgeEnvironment } = useLiveSimulation();
  const audienceMode = isSocView ? "soc" : "beginner";
  const [activeCase, setActiveCase] = useState<ScenarioCase | null>(getInitialDashboardCase);
  const [chartRevision, setChartRevision] = useState(0);
  const [caseHistoryCount, setCaseHistoryCount] = useState(() => readCaseHistory().length);
  const [hasActiveInvestigation, setHasActiveInvestigation] = useState(getInitialActiveInvestigationState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    getLatestSimulation().then(setResult);

    return () => window.cancelAnimationFrame(frame);
  }, []);


  useEffect(() => {
    function applyActiveCase(nextCase: ScenarioCase | null) {
      if (!nextCase?.chartData) {
        return;
      }

      setActiveCase(nextCase);
      setHasActiveInvestigation(true);
      setHasCompletedRun(window.localStorage.getItem(LAST_RUN_KEY) === "complete");
      setChartRevision((current) => current + 1);
    }

    function receiveActiveCase(event: Event) {
      applyActiveCase((event as CustomEvent<ScenarioCase>).detail);
    }

    function clearActiveInvestigation() {
      setHasActiveInvestigation(false);
      setActiveCase(null);
      setChartRevision((current) => current + 1);
    }

    function receiveStorageCase(event: StorageEvent) {
      if (event.key !== "adversim-active-case") {
        return;
      }

      const storedCase = parseStoredActiveCase(event.newValue);
      if (!storedCase) {
        clearActiveInvestigation();
        return;
      }

      setHasActiveInvestigation(true);
      applyActiveCase(storedCase);
    }

    const frame = window.requestAnimationFrame(() => {
      const storedCase = parseStoredActiveCase(window.localStorage.getItem("adversim-active-case"));
      setHasActiveInvestigation(Boolean(storedCase));
      applyActiveCase(storedCase);
    });

    window.addEventListener("adversim-active-case", receiveActiveCase);
    window.addEventListener("adversim-active-case-cleared", clearActiveInvestigation);
    window.addEventListener("storage", receiveStorageCase);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("adversim-active-case", receiveActiveCase);
      window.removeEventListener("adversim-active-case-cleared", clearActiveInvestigation);
      window.removeEventListener("storage", receiveStorageCase);
    };
  }, []);

  useEffect(() => {
    function syncCaseHistory() {
      setCaseHistoryCount(readCaseHistory().length);
    }

    function syncStorageHistory(event: StorageEvent) {
      if (event.key === "adversim-case-history") {
        syncCaseHistory();
      }
    }

    const frame = window.requestAnimationFrame(syncCaseHistory);
    window.addEventListener("adversim-case-history", syncCaseHistory);
    window.addEventListener("storage", syncStorageHistory);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("adversim-case-history", syncCaseHistory);
      window.removeEventListener("storage", syncStorageHistory);
    };
  }, []);
  useEffect(() => {
    function closeMetricInfo() {
      setActiveMetricInfo(null);
    }

    window.addEventListener("pointerdown", closeMetricInfo);
    return () => window.removeEventListener("pointerdown", closeMetricInfo);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMetricProgress(0));

    const interval = window.setInterval(() => {
      setMetricProgress((current) => {
        if (current >= 1) {
          window.clearInterval(interval);
          return 1;
        }

        return Math.min(1, current + 0.08);
      });
    }, 90);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, [result.summary.incident_count, result.summary.confidence, result.telemetry.length, result.timeline.length]);

  const isSystemIdle = !activeCase;
  const replayComplete = Boolean(activeCase) && (hasCompletedRun || streamCompleted);

  const severityData = useMemo(() => {
    if (!activeCase) {
      return [{ severity: "Idle", count: 1 }];
    }

    const data = severityLabels.map((severity, index) => ({
      severity,
      count: activeCase.chartData.severityHeat[index] ?? 0
    }));

    return data.some((item) => item.count > 0) ? data.filter((item) => item.count > 0) : [{ severity: "Idle", count: 1 }];
  }, [activeCase]);

  const tacticData = useMemo(() => {
    if (!activeCase) {
      return tacticLabels.map((tactic) => ({ tactic, count: 0.12 }));
    }

    return tacticLabels.map((tactic, index) => ({
      tactic,
      count: activeCase.chartData.mappedTactics[index] ?? 0
    }));
  }, [activeCase]);

  function resetEnvironment() {
    purgeEnvironment();
    clearCaseHistory();
    setActiveCase(null);
    setHasActiveInvestigation(false);
    setHasCompletedRun(false);
    setCaseHistoryCount(0);
    setMetricProgress(0);
    setChartRevision((current) => current + 1);
    setToastMessage("Lab Environment Purged.");
    window.setTimeout(() => setToastMessage(null), 2200);
  }

  const navigateFromTactics = () => {
    router.push(replayComplete ? "/timeline" : "/investigation");
  };

  const navigateFromSeverity = () => {
    router.push(replayComplete ? "/detections" : "/investigation");
  };

  const handoffItems = replayComplete
    ? replayHandoffItems
    : hasActiveInvestigation
      ? activeInvestigationHandoffItems
      : idleHandoffItems;

  const metrics: Array<{
    label: string;
    value: string | number;
    helper: string;
    info: string;
    icon: LucideIcon;
    color: string;
  }> = [
    {
      label: "Incidents",
      value: activeCase ? activeCase.key_evidence_event_ids.length : 0,
      helper: activeCase ? "Correlated clues" : "System idle",
      info: "Incidents are correlated groups of clues. After a run, open Detections to see why each alert fired.",
      icon: ShieldAlert,
      color: activeCase ? "text-crimson" : "text-zinc-500"
    },
    {
      label: "Confidence",
      value: activeCase ? `${activeCase.confidence}%` : "--",
      helper: activeCase ? "Weighted signal score" : "Awaiting telemetry",
      info: "Confidence rises when multiple signals agree, like identity, endpoint, file, DLP, and network evidence.",
      icon: Gauge,
      color: activeCase ? "text-lime" : "text-zinc-500"
    },
    {
      label: "Telemetry",
      value: activeCase ? activeCase.telemetry_events.length : 0,
      helper: activeCase ? "Synthetic events" : "No active feed",
      info: "Telemetry is the synthetic log stream. It is safe training data shaped like real defender evidence.",
      icon: Activity,
      color: activeCase ? "text-cobalt" : "text-zinc-500"
    },
    {
      label: "Timeline",
      value: activeCase ? activeCase.chartData.mappedTactics.filter((count) => count > 0).length : 0,
      helper: activeCase ? "Mapped stages" : "Not reconstructed",
      info: "Timeline reconstructs scattered logs into the sequence a SOC analyst needs for containment and reporting.",
      icon: Route,
      color: activeCase ? "text-zinc-200" : "text-zinc-500"
    }
  ];
  return (
    <div className={`space-y-5 ${isSocView ? "soc-dense-stack" : ""}`}>
      {toastMessage ? (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-[18px] border border-line bg-panel/90 px-4 py-3 text-sm font-semibold text-ink shadow-lime backdrop-blur-[20px]"
        >
          {toastMessage}
        </motion.div>
      ) : null}
      <motion.section
        layoutId="builder-hero"
        className={`glass-panel soc-precision relative overflow-hidden rounded-[32px] ${isSocView ? "p-4" : "p-6 sm:p-8 lg:p-10"}`}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className={`relative z-10 grid lg:items-end ${isSocView ? "gap-4 lg:grid-cols-[1fr_300px]" : "gap-8 lg:grid-cols-[1fr_360px]"}`}>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="technical rounded-full border border-lime/35 bg-lime/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-lime shadow-lime">
                Cybersecurity
              </span>
              <span className="technical inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-lime" />
                Investigation Mode
              </span>
              <span className="technical text-xs uppercase tracking-[0.32em] text-lime">
                AdverSim // synthetic defense lab
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal text-ink sm:text-6xl lg:text-7xl">
              AdverSim
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Learn cyber defense by investigating safe synthetic incidents. AI creates the case, you follow the clues, then AdverSim turns the evidence into detections, a timeline, and a report.
            </p>
            <ViewModeToggle className="mt-5" labels={{ beginner: "Beginner View", soc: "SOC View" }} />
            {!isSocView ? (
            <div className="mt-5 max-w-2xl rounded-[22px] border border-lime/20 bg-lime/[0.06] p-4">
              <div className="flex items-center gap-2 text-lime">
                <GraduationCap aria-hidden size={17} />
                <p className="technical text-xs uppercase tracking-[0.22em]">
                  {audienceMode === "beginner" ? "No cyber background needed" : "Blue-team workflow"}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {audienceMode === "beginner"
                  ? "Think of it like a detective case: logs are clues, detections are the suspicious patterns, the timeline is the story, and the report is your final answer."
                  : "Run a controlled adversary simulation, inspect synthetic telemetry, validate correlated detections, reconstruct sequence, and produce an analyst-ready incident brief."}
              </p>
            </div>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/investigation"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] bg-lime px-5 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                <Play aria-hidden size={18} />
                {hasActiveInvestigation ? "Resume Investigation" : "Start 60-Second Investigation"}
              </Link>
              <Link
                href="/director"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] border border-line bg-white/5 px-5 text-sm font-semibold text-ink transition hover:bg-white/10"
              >
                <Radar aria-hidden size={18} />
                Custom Lab Builder
              </Link>
              <Link
                href="/director"
                aria-label={`Open case history, ${caseHistoryCount} saved investigations`}
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] border border-line bg-black/30 px-4 text-sm font-semibold text-ink transition hover:border-lime/40 hover:text-lime"
              >
                <History aria-hidden size={18} />
                Case History
                <span className="technical rounded-full border border-lime/25 bg-lime/10 px-2 py-0.5 text-[10px] text-lime">
                  {caseHistoryCount}/5
                </span>
              </Link>
              <button
                type="button"
                onClick={resetEnvironment}
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] border border-line bg-black/20 px-4 text-sm font-semibold text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-200"
              >
                <RefreshCw aria-hidden size={16} />
                Reset Environment
              </button>
            </div>
          </div>

          <div className={`soc-compact-card rounded-[24px] border border-line bg-black/30 ${isSocView ? "p-3" : "p-5"}`}>
            <div className="flex items-center justify-between">
              <p className="technical text-xs uppercase tracking-[0.25em] text-zinc-500">
                {replayComplete ? "Active investigation" : hasActiveInvestigation ? "Active case" : "Mission"}
              </p>
              <span
                className={`technical rounded-full border px-3 py-1 text-xs ${
                  replayComplete
                    ? "border-crimson/30 bg-crimson/10 text-crimson"
                    : "border-lime/30 bg-lime/10 text-lime"
                }`}
              >
                {replayComplete ? activeCase?.severity ?? result.summary.severity : hasActiveInvestigation ? "Active" : "Ready"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-ink">
              {replayComplete ? "Case Ready To Investigate" : hasActiveInvestigation ? "Active Investigation" : "You Are The Analyst"}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {replayComplete
                ? `The replay is captured: ${activeCase?.key_evidence_event_ids.length ?? result.summary.incident_count} evidence signals staged, ${
                    activeCase?.chartData.mappedTactics.filter((count) => count > 0).length ?? result.timeline.length
                  } timeline stages mapped, and ${activeCase?.confidence ?? result.summary.confidence}% confidence available for analyst review.`
                : hasActiveInvestigation
                  ? "You have an active case staged. Check the charts, then jump back into the evidence board without losing the scenario."
                  : "AI stages a fake incident. Your job is to follow the clues, ask what the evidence means, and produce the report."}
            </p>
            <div className="mt-5 space-y-3">
              {handoffItems.map((item) => {
                const rowClassName =
                  "flex items-center gap-3 rounded-[16px] border border-line bg-white/[0.035] px-3 py-3 transition";
                const rowContent = (
                  <>
                    <CheckCircle2 aria-hidden size={16} className="text-lime" />
                    <span className="text-sm text-zinc-300">{item.label}</span>
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.ariaLabel}
                    className={`${rowClassName} focus-ring hover:border-lime/40 hover:bg-lime/[0.08] hover:text-ink`}
                  >
                    {rowContent}
                  </Link>
                ) : (
                  <div key={item.label} className={rowClassName}>
                    {rowContent}
                  </div>
                );
              })}
            </div>
            {replayComplete ? (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href="/investigation"
                  className="focus-ring flex h-10 items-center justify-center rounded-[14px] bg-lime text-xs font-bold text-obsidian shadow-lime transition hover:brightness-110"
                >
                  Investigate
                </Link>
                <Link
                  href="/timeline"
                  className="focus-ring flex h-10 items-center justify-center rounded-[14px] border border-line bg-white/5 text-xs font-semibold text-ink transition hover:border-lime/40"
                >
                  Timeline
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </motion.section>

      <section className={`relative z-40 grid overflow-visible lg:grid-cols-4 ${isSocView ? "gap-3" : "gap-5"}`}>
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <BentoCard
              key={metric.label}
              className={`relative overflow-visible ${activeMetricInfo === metric.label ? "z-50" : "z-10"}`}
            >
              <div className={`flex items-start justify-between ${isSocView ? "gap-2" : "gap-4"}`}>
                <div>
                  <p className="technical text-xs uppercase tracking-[0.24em] text-zinc-500">{metric.label}</p>
                  <p className={`${isSocView ? "mt-2 text-3xl" : "mt-3 text-4xl"} font-semibold text-ink`}>{metric.value}</p>
                </div>
                <button
                  type="button"
                  onPointerDown={(event) => {
                    event.stopPropagation();
                    setActiveMetricInfo((current) => (current === metric.label ? null : metric.label));
                  }}
                  onMouseEnter={() => setActiveMetricInfo(metric.label)}
                  onMouseLeave={() => setActiveMetricInfo(null)}
                  onFocus={() => setActiveMetricInfo(metric.label)}
                  onBlur={() => setActiveMetricInfo(null)}
                  className={`focus-ring grid h-11 w-11 place-items-center rounded-[16px] border border-line bg-white/5 transition hover:border-lime/40 hover:bg-lime/10 ${metric.color}`}
                  aria-label={`Explain ${metric.label}`}
                >
                  <MetricIcon aria-hidden size={20} />
                </button>
              </div>
              <p className={`${isSocView ? "mt-2 text-xs" : "mt-4 text-sm"} text-zinc-400`}>{metric.helper}</p>
              {activeMetricInfo === metric.label ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="guide-glass absolute right-4 top-16 z-[90] w-64 rounded-[18px] p-3"
                >
                  <p className="technical text-[10px] uppercase tracking-[0.18em] text-lime">{metric.label}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{metric.info}</p>
                </motion.div>
              ) : null}
            </BentoCard>
          );
        })}
      </section>

      <section className={`relative z-0 grid ${isSocView ? "gap-3 xl:grid-cols-2" : "gap-5 lg:grid-cols-[1.15fr_0.85fr]"}`}>
        <BentoCard className={isSocView ? "min-h-[420px]" : "min-h-[360px]"}>
          <div className={`${isSocView ? "mb-2" : "mb-5"} flex items-center justify-between gap-4`}>
            <div>
              <p className="technical text-xs uppercase tracking-[0.24em] text-lime">
                Detection coverage
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                Mapped Tactics
              </h2>
            </div>
            <Sparkles aria-hidden className="text-lime" size={19} />
          </div>
          <button
            type="button"
            onClick={navigateFromTactics}
            className={`focus-ring relative block w-full cursor-pointer rounded-[18px] text-left ${isSocView ? "h-[350px]" : "h-72"}`}
            aria-label={replayComplete ? "Open attack timeline" : hasActiveInvestigation ? "Resume investigation" : "Start 60-second investigation"}
          >
            {chartsReady ? (
              <ResponsiveContainer key={`tactics-${activeCase?.case_id ?? "idle"}-${chartRevision}`} width="100%" height="100%">
                <BarChart data={tacticData} margin={{ left: 0, right: 10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="tactic" tick={{ fontSize: 11, fill: "#71717a" }} interval={0} />
                  <YAxis allowDecimals={false} domain={isSystemIdle ? [0, 1] : undefined} tick={{ fontSize: 11, fill: "#52525b" }} />
                  {!isSystemIdle ? (
                    <Tooltip
                      cursor={{ fill: "rgba(223,255,0,0.05)" }}
                      contentStyle={{
                        background: "rgba(26,26,27,0.94)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 16,
                        color: "#f8fafc"
                      }}
                    />
                  ) : null}
                  <Bar dataKey="count" fill={isSystemIdle ? "#2a2a2a" : "#dfff00"} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
            {isSystemIdle ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="technical rounded-full border border-line bg-black/45 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  [ AWAITING TELEMETRY ]
                </span>
              </div>
            ) : null}
          </button>
          <p className="technical mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click chart to {replayComplete ? "open Timeline" : hasActiveInvestigation ? "resume Investigation" : "start Investigation"}
          </p>
        </BentoCard>

        <BentoCard className={isSocView ? "min-h-[420px]" : "min-h-[360px]"}>
          <div className={isSocView ? "mb-2" : "mb-5"}>
            <p className="technical text-xs uppercase tracking-[0.24em] text-crimson">
              Incident heat
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Severity Breakdown</h2>
          </div>
          <button
            type="button"
            onClick={navigateFromSeverity}
            className={`focus-ring relative block w-full cursor-pointer rounded-[18px] ${isSocView ? "h-[350px]" : "h-72"}`}
            aria-label={replayComplete ? "Open detections" : hasActiveInvestigation ? "Resume investigation" : "Start 60-second investigation"}
          >
            {chartsReady ? (
              <ResponsiveContainer key={`severity-${activeCase?.case_id ?? "idle"}-${chartRevision}`} width="100%" height="100%">
                <PieChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <Pie
                    data={severityData}
                    dataKey="count"
                    nameKey="severity"
                    outerRadius={104}
                    innerRadius={isSystemIdle ? 94 : 58}
                    label={!isSystemIdle}
                    isAnimationActive
                  >
                    {severityData.map((item) => (
                      <Cell key={item.severity} fill={severityColors[item.severity] ?? "#2a2a2a"} />
                    ))}
                  </Pie>
                  {!isSystemIdle ? (
                    <Tooltip
                      contentStyle={{
                        background: "rgba(26,26,27,0.94)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 16,
                        color: "#f8fafc"
                      }}
                    />
                  ) : null}
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            {isSystemIdle ? (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="technical rounded-full border border-line bg-black/45 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  [ SYSTEM IDLE ]
                </span>
              </div>
            ) : null}
          </button>
          <p className="technical mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click chart to {replayComplete ? "open Detections" : hasActiveInvestigation ? "resume Investigation" : "start Investigation"}
          </p>
        </BentoCard>
      </section>

      <motion.section
        layoutId="telemetry-pulse-panel"
        className={`glass-panel soc-precision rounded-[24px] ${isSocView ? "p-3" : "p-5"}`}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="technical text-xs uppercase tracking-[0.24em] text-lime">
              {replayComplete ? "Active case flow" : "Lab navigation flow"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              {"Builder -> Telemetry -> Detections -> Timeline -> Report"}
            </h2>
          </div>
          {replayComplete ? (
            <AlertTriangle aria-hidden className="text-crimson" size={20} />
          ) : (
            <Compass aria-hidden className="text-lime" size={20} />
          )}
        </div>
        <div className={`grid md:grid-cols-5 ${isSocView ? "mt-3 gap-2" : "mt-5 gap-3"}`}>
          {["Builder", "Telemetry", "Detections", "Timeline", "Report"].map((step, index) => (
            <div key={step} className={`soc-compact-card rounded-[18px] border border-line bg-black/25 ${isSocView ? "p-2" : "p-4"}`}>
              <p className="technical text-[11px] uppercase tracking-[0.22em] text-zinc-500">0{index + 1}</p>
              <p className="mt-3 text-sm font-semibold text-ink">{step}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}



