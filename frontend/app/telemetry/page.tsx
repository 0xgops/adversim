"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Database, RadioTower } from "lucide-react";
import { useViewMode } from "@/components/ViewModeProvider";
import { readActiveCase, subscribeToActiveCase } from "@/lib/active-case";
import type { ScenarioCase } from "@/types/adversim";

function severityClass(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized === "critical") {
    return "border-crimson/30 bg-crimson/10 text-crimson";
  }

  if (normalized === "high") {
    return "border-orange-400/30 bg-orange-400/10 text-orange-300";
  }

  if (normalized === "medium") {
    return "border-lime/30 bg-lime/10 text-lime";
  }

  return "border-cobalt/30 bg-cobalt/10 text-cobalt";
}

export default function TelemetryPage() {
  const [activeCase, setActiveCase] = useState<ScenarioCase | null>(readActiveCase);
  const { isSocView } = useViewMode();

  useEffect(() => {
    return subscribeToActiveCase(setActiveCase);
  }, []);

  const telemetry = useMemo(() => activeCase?.telemetry_events ?? [], [activeCase]);
  const sourceMix = useMemo(() => Array.from(new Set(telemetry.map((event) => event.source))), [telemetry]);

  return (
    <div className={`space-y-5 ${isSocView ? "soc-dense-stack" : ""}`}>
      <motion.section
        layoutId="telemetry-pulse-panel"
        className={`glass-panel soc-precision rounded-[32px] ${isSocView ? "p-4" : "p-6 sm:p-8"}`}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Pulse Telemetry</p>
            <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Synthetic Log Stream</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              {activeCase
                ? `Defensive signals generated from ${activeCase.scenario_family}.`
                : "Stage an incident to open the synthetic telemetry connection."}
            </p>
          </div>
          <div className="technical flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300">
            <RadioTower aria-hidden size={15} className={activeCase ? "text-lime" : "text-zinc-500"} />
            {telemetry.length} events
          </div>
        </div>
      </motion.section>

      <section className={`grid ${isSocView ? "gap-3 lg:grid-cols-1" : "gap-5 lg:grid-cols-[1fr_330px]"}`}>
        <div className="glass-panel soc-precision overflow-hidden rounded-[24px]">
          <div className={`flex items-center justify-between border-b border-line ${isSocView ? "px-3 py-3" : "px-5 py-4"}`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-line bg-lime/10 text-lime">
                <Activity aria-hidden size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-ink">Live Event Feed</h2>
                <p className="technical text-xs uppercase tracking-[0.2em] text-zinc-500">Fira Code telemetry</p>
              </div>
            </div>
          </div>

          {telemetry.length ? (
            <motion.ul layout className={`${isSocView ? "max-h-[720px]" : "max-h-[620px]"} divide-y divide-line overflow-hidden`}>
              {telemetry.map((event, index) => (
                <motion.li
                  key={event.event_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: index * 0.035 }}
                  className={`soc-terminal-copy grid ${isSocView ? "gap-2 px-3 py-3 lg:grid-cols-[125px_130px_1fr_96px]" : "gap-3 px-5 py-4 lg:grid-cols-[120px_140px_1fr_110px]"}`}
                >
                  <span className="technical text-xs text-lime">{event.timestamp}</span>
                  <span className="technical text-xs uppercase tracking-[0.18em] text-zinc-500">{event.source}</span>
                <p className="technical text-sm leading-6 text-zinc-200">{event.summary}</p>
                  <span
                    className={`technical inline-flex h-7 w-fit items-center rounded-full border px-2.5 text-[10px] uppercase tracking-[0.18em] ${severityClass(
                      event.severity
                    )}`}
                  >
                    {event.severity}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <div className="grid min-h-[420px] place-items-center bg-black/20 p-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="mx-auto h-2 w-44 rounded-full bg-[#2a2a2a]" />
                <p className="technical mt-6 text-sm uppercase tracking-[0.28em] text-zinc-500">[ CONNECTION IDLE ]</p>
                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                  The telemetry stream is cleared and waiting for a staged case.
                </p>
              </motion.div>
            </div>
          )}
        </div>

        {!isSocView ? (
        <aside className="glass-panel soc-precision rounded-[24px] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-line bg-white/5 text-lime">
            <Database aria-hidden size={21} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink">Source Mix</h2>
          <div className="mt-5 space-y-3">
            {sourceMix.length ? (
              sourceMix.map((source) => (
                <div key={source} className="rounded-[18px] border border-line bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="technical text-xs uppercase tracking-[0.22em] text-zinc-300">{source}</span>
                    <span className="technical text-xs text-lime">
                      {telemetry.filter((event) => event.source === source).length}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-line bg-black/25 p-4">
                <span className="technical text-xs uppercase tracking-[0.22em] text-zinc-500">No source feed</span>
              </div>
            )}
          </div>
        </aside>
        ) : null}
      </section>
    </div>
  );
}
