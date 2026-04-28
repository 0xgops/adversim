"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { getLatestSimulation } from "@/lib/api";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { SimulationResult } from "@/types/adversim";

export default function DetectionsPage() {
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);

  useEffect(() => {
    getLatestSimulation().then(setResult);
  }, []);

  return (
    <div className="space-y-5">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Detection Engine</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
          Suspicious Activity Findings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Placeholder analytics correlate synthetic telemetry into analyst-friendly findings and response guidance.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {result.detections.map((detection, index) => (
          <motion.article
            key={detection.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
            className="glass-panel rounded-[24px] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-line bg-lime/10 text-lime">
                  <ShieldCheck aria-hidden size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink">{detection.name}</h2>
                  <p className="technical mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">{detection.tactic}</p>
                </div>
              </div>
              <SeverityBadge severity={detection.severity} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-line bg-black/25 p-4">
                <p className="technical text-[11px] uppercase tracking-[0.22em] text-zinc-500">Confidence</p>
                <p className="mt-2 text-3xl font-semibold text-lime">{detection.confidence}%</p>
              </div>
              <div className="rounded-[18px] border border-line bg-black/25 p-4">
                <p className="technical text-[11px] uppercase tracking-[0.22em] text-zinc-500">Matched Events</p>
                <p className="technical mt-3 text-xs leading-5 text-zinc-300">{detection.matched_event_ids.join(" / ")}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[18px] border border-line bg-white/5 p-4">
              <div className="flex items-center gap-2 text-lime">
                <Sparkles aria-hidden size={15} />
                <p className="technical text-[11px] uppercase tracking-[0.22em]">Recommended response</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{detection.recommendation}</p>
            </div>
          </motion.article>
        ))}
      </section>
    </div>
  );
}
