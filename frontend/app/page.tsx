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
import { getLatestSimulation } from "@/lib/api";
import { readCaseHistory } from "@/lib/case-history";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import { generateQuickStartCase } from "@/lib/scenario-director";
import type { ScenarioCase, SimulationResult } from "@/types/adversim";
import type { LucideIcon } from "lucide-react";

const severityColors: Record<string, string> = {
  High: "#ff8a3d",
  Critical: "#ff2d55",
  Medium: "#dfff00",
  Low: "#60a5fa",
  Ready: "#dfff00"
};

const tacticLabels = ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"];
const severityLabels = ["Low", "Medium", "High", "Critical"];

function getInitialActiveCase() {
  return generateQuickStartCase({ seed: "dashboard-static-preview", caseNumber: 1 });
}

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
  return <section className={`glass-panel rounded-[24px] p-5 ${className}`}>{children}</section>;
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
  const [hasCompletedRun] = useState(getInitialRunState);
  const [activeMetricInfo, setActiveMetricInfo] = useState<string | null>(null);
  const [audienceMode, setAudienceMode] = useState<"beginner" | "soc">("beginner");
  const [activeCase, setActiveCase] = useState<ScenarioCase>(getInitialActiveCase);
  const [chartRevision, setChartRevision] = useState(0);
  const [caseHistoryCount, setCaseHistoryCount] = useState(() => readCaseHistory().length);
  const [hasActiveInvestigation, setHasActiveInvestigation] = useState(getInitialActiveInvestigationState);

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
      setChartRevision((current) => current + 1);
    }

    function receiveActiveCase(event: Event) {
      applyActiveCase((event as CustomEvent<ScenarioCase>).detail);
    }

    function receiveStorageCase(event: StorageEvent) {
      if (event.key !== "adversim-active-case") {
        return;
      }

      const storedCase = parseStoredActiveCase(event.newValue);
      setHasActiveInvestigation(Boolean(storedCase));
      applyActiveCase(storedCase);
    }

    const frame = window.requestAnimationFrame(() => {
      const storedCase = parseStoredActiveCase(window.localStorage.getItem("adversim-active-case"));
      setHasActiveInvestigation(Boolean(storedCase));
      applyActiveCase(storedCase);
    });

    window.addEventListener("adversim-active-case", receiveActiveCase);
    window.addEventListener("storage", receiveStorageCase);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("adversim-active-case", receiveActiveCase);
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

  const severityData = useMemo(() => {
    const data = severityLabels.map((severity, index) => ({
      severity,
      count: activeCase.chartData.severityHeat[index] ?? 0
    }));

    return data.some((item) => item.count > 0) ? data.filter((item) => item.count > 0) : [{ severity: "Low", count: 1 }];
  }, [activeCase]);

  const tacticData = useMemo(() => tacticLabels.map((tactic, index) => ({
    tactic,
    count: activeCase.chartData.mappedTactics[index] ?? 0
  })), [activeCase]);

  const navigateFromTactics = () => {
    router.push(hasCompletedRun ? "/timeline" : "/investigation");
  };

  const navigateFromSeverity = () => {
    router.push(hasCompletedRun ? "/detections" : "/investigation");
  };


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
      value: hasCompletedRun ? Math.round(result.summary.incident_count * metricProgress) : 0,
      helper: hasCompletedRun ? "Suspicious clusters" : "Ready after first run",
      info: "Incidents are correlated groups of clues. After a run, open Detections to see why each alert fired.",
      icon: ShieldAlert,
      color: hasCompletedRun ? "text-crimson" : "text-lime"
    },
    {
      label: "Confidence",
      value: hasCompletedRun ? `${Math.round(result.summary.confidence * metricProgress)}%` : "Ready",
      helper: hasCompletedRun ? "Weighted signal score" : "Run a mock incident",
      info: "Confidence rises when multiple signals agree, like identity, endpoint, file, DLP, and network evidence.",
      icon: Gauge,
      color: "text-lime"
    },
    {
      label: "Telemetry",
      value: hasCompletedRun ? Math.round(result.telemetry.length * metricProgress) : 0,
      helper: hasCompletedRun ? "Synthetic events" : "Generated on replay",
      info: "Telemetry is the synthetic log stream. It is safe training data shaped like real defender evidence.",
      icon: Activity,
      color: "text-cobalt"
    },
    {
      label: "Timeline",
      value: hasCompletedRun ? Math.round(result.timeline.length * metricProgress) : 0,
      helper: hasCompletedRun ? "Reconstructed stages" : "Unlocked after run",
      info: "Timeline turns scattered logs into the story of what happened, when, and why it matters.",
      icon: Route,
      color: "text-zinc-200"
    }
  ];

  return (
    <div className="space-y-5">
      <motion.section
        layoutId="builder-hero"
        className="glass-panel relative overflow-hidden rounded-[32px] p-6 sm:p-8 lg:p-10"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="technical rounded-full border border-lime/35 bg-lime/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-lime shadow-lime">
                Cybersecurity
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
            <div className="mt-5 inline-flex rounded-full border border-line bg-black/25 p-1">
              {[
                ["beginner", "Beginner View"],
                ["soc", "SOC View"]
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAudienceMode(mode as "beginner" | "soc")}
                  className={`focus-ring rounded-full px-4 py-2 text-xs font-semibold transition ${
                    audienceMode === mode ? "bg-lime text-obsidian shadow-lime" : "text-zinc-400 hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-black/30 p-5">
            <div className="flex items-center justify-between">
              <p className="technical text-xs uppercase tracking-[0.25em] text-zinc-500">
                {hasCompletedRun ? "Investigation complete" : "Mission"}
              </p>
              <span
                className={`technical rounded-full border px-3 py-1 text-xs ${
                  hasCompletedRun
                    ? "border-crimson/30 bg-crimson/10 text-crimson"
                    : "border-lime/30 bg-lime/10 text-lime"
                }`}
              >
                {hasCompletedRun ? result.summary.severity : "Ready"}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-ink">
              {hasCompletedRun ? "Case Closed" : "You Are The Analyst"}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {hasCompletedRun
                ? `${result.summary.incident_count} detections reviewed, ${result.timeline.length} stages reconstructed, and ${result.summary.confidence}% confidence earned.`
                : hasActiveInvestigation
                  ? "You have an active case staged. Check the charts, then jump back into the evidence board without losing the scenario."
                  : "AI stages a fake incident. Your job is to follow the clues, ask what the evidence means, and produce the report."}
            </p>
            <div className="mt-5 space-y-3">
              {(hasCompletedRun
                ? ["Detections reviewed", "Timeline reconstructed", "Report ready"]
                : hasActiveInvestigation
                  ? ["Review dashboard heat", "Resume the evidence board", "Submit your finding"]
                  : ["Start the replay", "Watch logs appear", "Ask AI what it means"]
              ).map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[16px] border border-line bg-white/[0.035] px-3 py-3">
                  <CheckCircle2 aria-hidden size={16} className="text-lime" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
            {hasCompletedRun ? (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href="/timeline"
                  className="focus-ring flex h-10 items-center justify-center rounded-[14px] border border-line bg-white/5 text-xs font-semibold text-ink transition hover:border-lime/40"
                >
                  Timeline
                </Link>
                <Link
                  href="/reports"
                  className="focus-ring flex h-10 items-center justify-center rounded-[14px] bg-lime text-xs font-bold text-obsidian shadow-lime transition hover:brightness-110"
                >
                  Report
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-4">
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <BentoCard key={metric.label} className="relative overflow-visible">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="technical text-xs uppercase tracking-[0.24em] text-zinc-500">{metric.label}</p>
                  <p className="mt-3 text-4xl font-semibold text-ink">{metric.value}</p>
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
              <p className="mt-4 text-sm text-zinc-400">{metric.helper}</p>
              {activeMetricInfo === metric.label ? (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  className="guide-glass absolute right-4 top-16 z-30 w-64 rounded-[18px] p-3"
                >
                  <p className="technical text-[10px] uppercase tracking-[0.18em] text-lime">{metric.label}</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">{metric.info}</p>
                </motion.div>
              ) : null}
            </BentoCard>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <BentoCard className="min-h-[360px]">
          <div className="mb-5 flex items-center justify-between gap-4">
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
            className="focus-ring block h-72 w-full cursor-pointer rounded-[18px] text-left"
            aria-label={hasCompletedRun ? "Open attack timeline" : hasActiveInvestigation ? "Resume investigation" : "Start 60-second investigation"}
          >
            {chartsReady ? (
              <ResponsiveContainer key={`tactics-${activeCase.case_id}-${chartRevision}`} width="100%" height="100%">
                <BarChart data={tacticData} margin={{ left: 0, right: 10, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 8" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="tactic" tick={{ fontSize: 11, fill: "#a1a1aa" }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(223,255,0,0.05)" }}
                    contentStyle={{
                      background: "rgba(26,26,27,0.94)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "#f8fafc"
                    }}
                  />
                  <Bar dataKey="count" fill="#dfff00" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </button>
          <p className="technical mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click chart to {hasCompletedRun ? "open Timeline" : hasActiveInvestigation ? "resume Investigation" : "start Investigation"}
          </p>
        </BentoCard>

        <BentoCard className="min-h-[360px]">
          <div className="mb-5">
            <p className="technical text-xs uppercase tracking-[0.24em] text-crimson">
              Incident heat
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Severity Breakdown</h2>
          </div>
          <button
            type="button"
            onClick={navigateFromSeverity}
            className="focus-ring block h-72 w-full cursor-pointer rounded-[18px]"
            aria-label={hasCompletedRun ? "Open detections" : hasActiveInvestigation ? "Resume investigation" : "Start 60-second investigation"}
          >
            {chartsReady ? (
              <ResponsiveContainer key={`severity-${activeCase.case_id}-${chartRevision}`} width="100%" height="100%">
                <PieChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <Pie
                    data={severityData}
                    dataKey="count"
                    nameKey="severity"
                    outerRadius={104}
                    innerRadius={58}
                    label
                    isAnimationActive
                  >
                    {severityData.map((item) => (
                      <Cell key={item.severity} fill={severityColors[item.severity] ?? "#71717a"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(26,26,27,0.94)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      color: "#f8fafc"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
          </button>
          <p className="technical mt-3 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Click chart to {hasCompletedRun ? "open Detections" : hasActiveInvestigation ? "resume Investigation" : "start Investigation"}
          </p>
        </BentoCard>
      </section>

      <motion.section
        layoutId="telemetry-pulse-panel"
        className="glass-panel rounded-[24px] p-5"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="technical text-xs uppercase tracking-[0.24em] text-lime">
              {hasCompletedRun ? "Live simulation flow" : "Lab navigation flow"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              {"Builder -> Telemetry -> Detections -> Timeline -> Report"}
            </h2>
          </div>
          {hasCompletedRun ? (
            <AlertTriangle aria-hidden className="text-crimson" size={20} />
          ) : (
            <Compass aria-hidden className="text-lime" size={20} />
          )}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {["Builder", "Telemetry", "Detections", "Timeline", "Report"].map((step, index) => (
            <div key={step} className="rounded-[18px] border border-line bg-black/25 p-4">
              <p className="technical text-[11px] uppercase tracking-[0.22em] text-zinc-500">0{index + 1}</p>
              <p className="mt-3 text-sm font-semibold text-ink">{step}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}



