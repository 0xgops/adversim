"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { getLatestSimulation } from "@/lib/api";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { SimulationResult } from "@/types/adversim";

export default function TimelinePage() {
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);

  useEffect(() => {
    getLatestSimulation().then(setResult);
  }, []);

  return (
    <div className="space-y-5">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Attack Timeline</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
          Reconstructed Incident Sequence
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Ordered analyst view that connects detections back to the synthetic activity chain.
        </p>
      </section>

      <section className="glass-panel rounded-[24px] p-6">
        <ol className="relative space-y-6 border-l border-line pl-6">
          {result.timeline.map((item, index) => (
            <motion.li
              key={`${item.timestamp}-${item.title}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="relative rounded-[20px] border border-line bg-black/25 p-4"
            >
              <span className="absolute -left-[33px] top-5 grid h-4 w-4 place-items-center rounded-full border-2 border-obsidian bg-lime shadow-lime" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <time className="technical text-xs uppercase tracking-[0.22em] text-lime">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold text-ink">{item.title}</h2>
                </div>
                <SeverityBadge severity={item.severity} />
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{item.description}</p>
              <p className="technical mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-300">
                <Route aria-hidden size={13} className="text-lime" />
                {item.tactic}
              </p>
            </motion.li>
          ))}
        </ol>
      </section>
    </div>
  );
}
