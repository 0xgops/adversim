"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Compass, FileText, Gauge, Radar, Route, ShieldAlert, Sparkles } from "lucide-react";
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
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { SimulationResult } from "@/types/adversim";
import type { LucideIcon } from "lucide-react";

const severityColors: Record<string, string> = {
  High: "#ff8a3d",
  Critical: "#ff2d55",
  Medium: "#dfff00",
  Low: "#60a5fa",
  Ready: "#dfff00"
};

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

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);
  const [chartsReady, setChartsReady] = useState(false);
  const [metricProgress, setMetricProgress] = useState(0);
  const [hasCompletedRun] = useState(getInitialRunState);
  const [activeMetricInfo, setActiveMetricInfo] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setChartsReady(true));
    getLatestSimulation().then(setResult);

    return () => window.cancelAnimationFrame(frame);
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
    if (!hasCompletedRun) {
      return [{ severity: "Ready", count: 1 }];
    }

    const counts = result.detections.reduce<Record<string, number>>((acc, detection) => {
      acc[detection.severity] = (acc[detection.severity] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([severity, count]) => ({ severity, count }));
  }, [hasCompletedRun, result.detections]);

  const tacticData = useMemo(() => {
    if (!hasCompletedRun) {
      return ["Builder", "Telemetry", "Detections", "Timeline", "Report"].map((tactic) => ({
        tactic,
        count: 1
      }));
    }

    return result.summary.mapped_tactics.map((tactic) => ({
      tactic,
      count: result.detections.filter((detection) => detection.tactic === tactic).length || 1
    }));
  }, [hasCompletedRun, result.detections, result.summary.mapped_tactics]);

  const navigateFromTactics = () => {
    router.push(hasCompletedRun ? "/timeline" : "/builder");
  };

  const navigateFromSeverity = () => {
    router.push(hasCompletedRun ? "/detections" : "/builder");
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
            <p className="technical text-xs uppercase tracking-[0.32em] text-lime">AI mock-incident lab for defenders</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-normal text-ink sm:text-6xl lg:text-7xl">
              AdverSim
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
              Ask AI to create a safe mock security incident, then practice identifying clues, reading logs, reconstructing the timeline, and writing the response.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/builder"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] bg-lime px-5 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                <Radar aria-hidden size={18} />
                Build Mock Incident
              </Link>
              <Link
                href="/reports"
                className="focus-ring inline-flex h-12 items-center gap-2 rounded-[18px] border border-line bg-white/5 px-5 text-sm font-semibold text-ink transition hover:bg-white/10"
              >
                <FileText aria-hidden size={18} />
                View Report
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-black/30 p-5">
            <div className="flex items-center justify-between">
              <p className="technical text-xs uppercase tracking-[0.25em] text-zinc-500">Current run</p>
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
              {hasCompletedRun ? result.summary.status : "Ready to Build"}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {hasCompletedRun
                ? `${result.summary.incident_count} correlated detections across ${result.summary.mapped_tactics.length} mapped tactics.`
                : "Start a mock incident in the Builder to heat up the dashboard."}
            </p>
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
                {hasCompletedRun ? "Detection coverage" : "Lab route"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">
                {hasCompletedRun ? "Mapped Tactics" : "How The Lab Flows"}
              </h2>
            </div>
            <Sparkles aria-hidden className="text-lime" size={19} />
          </div>
          <button
            type="button"
            onClick={navigateFromTactics}
            className="focus-ring block h-72 w-full cursor-pointer rounded-[18px] text-left"
            aria-label={hasCompletedRun ? "Open attack timeline" : "Open mock incident builder"}
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
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
            Click chart to open {hasCompletedRun ? "Timeline" : "Builder"}
          </p>
        </BentoCard>

        <BentoCard className="min-h-[360px]">
          <div className="mb-5">
            <p
              className={`technical text-xs uppercase tracking-[0.24em] ${
                hasCompletedRun ? "text-crimson" : "text-lime"
              }`}
            >
              {hasCompletedRun ? "Incident heat" : "Readiness"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              {hasCompletedRun ? "Severity Breakdown" : "Awaiting First Run"}
            </h2>
          </div>
          <button
            type="button"
            onClick={navigateFromSeverity}
            className="focus-ring block h-72 w-full cursor-pointer rounded-[18px]"
            aria-label={hasCompletedRun ? "Open detections" : "Open mock incident builder"}
          >
            {chartsReady ? (
              <ResponsiveContainer width="100%" height="100%">
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
            Click chart to open {hasCompletedRun ? "Detections" : "Builder"}
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
            <h2 className="mt-2 text-xl font-semibold text-ink">Builder → Telemetry → Detections → Timeline → Report</h2>
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
