"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useViewMode } from "@/components/ViewModeProvider";
import { readActiveCase, subscribeToActiveCase } from "@/lib/active-case";
import type { EvidenceEvent, ScenarioCase } from "@/types/adversim";

function tacticForEvent(event: EvidenceEvent) {
  const tags = new Set(event.tags);

  if (tags.has("credential-access") || tags.has("identity") || tags.has("cloud")) return "Credential Access";
  if (tags.has("execution") || tags.has("script") || tags.has("process") || tags.has("edr") || tags.has("staging")) return "Execution";
  if (tags.has("privilege") || tags.has("privilege-review") || tags.has("remote-admin")) return "Privilege Escalation";
  if (tags.has("exfiltration") || tags.has("egress") || tags.has("sharing") || tags.has("network") || tags.has("dlp")) return "Exfiltration";
  return "Discovery";
}

export default function TimelinePage() {
  const [activeCase, setActiveCase] = useState<ScenarioCase | null>(readActiveCase);
  const { isSocView } = useViewMode();

  useEffect(() => {
    return subscribeToActiveCase(setActiveCase);
  }, []);

  const timeline = useMemo(
    () => (activeCase ? activeCase.telemetry_events.filter((event) => event.is_key_evidence).slice().reverse() : []),
    [activeCase]
  );

  return (
    <div className={`space-y-5 ${isSocView ? "soc-dense-stack" : ""}`}>
      <section className={`glass-panel soc-precision rounded-[32px] ${isSocView ? "p-4" : "p-6 sm:p-8"}`}>
        <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Attack Timeline</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
          Reconstructed Incident Sequence
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          {activeCase
            ? `Ordered analyst view for ${activeCase.case_id}, rebuilt from the staged synthetic evidence.`
            : "Stage an incident to reconstruct a synthetic activity sequence."}
        </p>
      </section>

      {timeline.length ? (
        <section className={`glass-panel soc-precision rounded-[24px] ${isSocView ? "p-4" : "p-6"}`}>
          <ol className={`relative border-l border-line pl-6 ${isSocView ? "space-y-3" : "space-y-6"}`}>
            {timeline.map((item, index) => (
              <motion.li
                key={`${activeCase?.case_id}-${item.event_id}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`soc-compact-card relative rounded-[20px] border border-line bg-black/25 ${isSocView ? "p-3" : "p-4"}`}
              >
                <span className="absolute -left-[33px] top-5 grid h-4 w-4 place-items-center rounded-full border-2 border-obsidian bg-lime shadow-lime" />
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <time className="technical text-xs uppercase tracking-[0.22em] text-lime">
                      {item.timestamp}
                    </time>
                    <h2 className="mt-2 text-lg font-semibold text-ink">{item.summary}</h2>
                  </div>
                  <SeverityBadge severity={item.severity} />
                </div>
                <p className={`mt-3 text-sm leading-6 text-zinc-300 ${isSocView ? "soc-terminal-copy" : ""}`}>{item.plain_english}</p>
                <p className="technical mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-300">
                  <Route aria-hidden size={13} className="text-lime" />
                  {tacticForEvent(item)}
                </p>
              </motion.li>
            ))}
          </ol>
        </section>
      ) : (
        <section className={`glass-panel soc-precision grid min-h-[420px] place-items-center rounded-[24px] ${isSocView ? "p-4" : "p-6"}`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="relative border-l border-line/80 pl-8">
              {[0, 1, 2].map((item) => (
                <div key={item} className="relative mb-7 last:mb-0">
                  <span className="absolute -left-[39px] top-2 h-4 w-4 rounded-full border border-line bg-[#2a2a2a]" />
                  <div className="h-20 rounded-[20px] border border-line bg-white/[0.025]" />
                </div>
              ))}
            </div>
            <p className="technical mt-8 text-center text-sm uppercase tracking-[0.28em] text-zinc-500">
              [ AWAITING RECONSTRUCTION ]
            </p>
          </motion.div>
        </section>
      )}
    </div>
  );
}
