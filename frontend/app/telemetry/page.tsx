"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Database, RadioTower } from "lucide-react";
import { getLatestSimulation } from "@/lib/api";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { SimulationResult } from "@/types/adversim";

function severityClass(severity: string) {
  if (severity === "critical") {
    return "border-crimson/30 bg-crimson/10 text-crimson";
  }

  if (severity === "high") {
    return "border-orange-400/30 bg-orange-400/10 text-orange-300";
  }

  return "border-lime/30 bg-lime/10 text-lime";
}

export default function TelemetryPage() {
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);

  useEffect(() => {
    getLatestSimulation().then(setResult);
  }, []);

  return (
    <div className="space-y-5">
      <motion.section
        layoutId="telemetry-pulse-panel"
        className="glass-panel rounded-[32px] p-6 sm:p-8"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Pulse Telemetry</p>
            <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Synthetic Log Stream</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Realistic defensive signals generated from the Credential Compromise Chain.
            </p>
          </div>
          <div className="technical flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300">
            <RadioTower aria-hidden size={15} className="text-lime" />
            {result.telemetry.length} events
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 lg:grid-cols-[1fr_330px]">
        <div className="glass-panel overflow-hidden rounded-[24px]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
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

          <motion.ul layout className="max-h-[620px] divide-y divide-line overflow-hidden">
            {result.telemetry.map((event, index) => (
              <motion.li
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.035 }}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[120px_140px_1fr_110px]"
              >
                <span className="technical text-xs text-lime">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="technical text-xs uppercase tracking-[0.18em] text-zinc-500">{event.source}</span>
                <p className="technical text-sm leading-6 text-zinc-200">{event.message}</p>
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
        </div>

        <aside className="glass-panel rounded-[24px] p-5">
          <div className="grid h-12 w-12 place-items-center rounded-[16px] border border-line bg-white/5 text-lime">
            <Database aria-hidden size={21} />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-ink">Source Mix</h2>
          <div className="mt-5 space-y-3">
            {Array.from(new Set(result.telemetry.map((event) => event.source))).map((source) => (
              <div key={source} className="rounded-[18px] border border-line bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="technical text-xs uppercase tracking-[0.22em] text-zinc-300">{source}</span>
                  <span className="technical text-xs text-lime">
                    {result.telemetry.filter((event) => event.source === source).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
