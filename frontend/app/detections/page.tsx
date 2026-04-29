"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { readActiveCase, subscribeToActiveCase } from "@/lib/active-case";
import type { Detection, EvidenceEvent, ScenarioCase } from "@/types/adversim";

function tacticForEvent(event: EvidenceEvent) {
  const tags = new Set(event.tags);

  if (tags.has("credential-access") || tags.has("identity") || tags.has("cloud")) return "Credential Access";
  if (tags.has("execution") || tags.has("script") || tags.has("process") || tags.has("edr") || tags.has("staging")) return "Execution";
  if (tags.has("privilege") || tags.has("privilege-review") || tags.has("remote-admin")) return "Privilege Escalation";
  if (tags.has("exfiltration") || tags.has("egress") || tags.has("sharing") || tags.has("network") || tags.has("dlp")) return "Exfiltration";
  return "Discovery";
}

function confidenceForEvent(caseFile: ScenarioCase, event: EvidenceEvent, index: number) {
  const severityBoost = {
    Low: -14,
    Medium: -6,
    High: 2,
    Critical: 7
  } satisfies Record<EvidenceEvent["severity"], number>;

  return Math.max(58, Math.min(97, caseFile.confidence + severityBoost[event.severity] - index * 2));
}

function recommendationForEvent(caseFile: ScenarioCase, event: EvidenceEvent) {
  const tactic = tacticForEvent(event);
  const caseAction = caseFile.recommended_response.find((action) => {
    const normalized = action.toLowerCase();

    if (tactic === "Credential Access") return /account|auth|mfa|session|sign-in/.test(normalized);
    if (tactic === "Execution") return /endpoint|process|host|maintenance/.test(normalized);
    if (tactic === "Privilege Escalation") return /privileged|admin|group|access/.test(normalized);
    if (tactic === "Exfiltration") return /egress|outbound|share|transfer|destination|dlp/.test(normalized);
    return /file|telemetry|evidence|logs/.test(normalized);
  });
  const suffix = caseAction ? ` Priority action: ${caseAction}.` : "";

  if (tactic === "Credential Access") return `Validate sign-in context, session history, and MFA posture before escalating the identity finding.${suffix}`;
  if (tactic === "Execution") return `Inspect endpoint lineage and compare the behavior against approved administrative workflows.${suffix}`;
  if (tactic === "Privilege Escalation") return `Audit privileged access changes and confirm authorization with the resource owner.${suffix}`;
  if (tactic === "Exfiltration") return `Review outbound destination, transfer timing, and data exposure scope.${suffix}`;
  return `Correlate the clue with adjacent identity, endpoint, and network signals.${suffix}`;
}

function buildDetections(caseFile: ScenarioCase): Detection[] {
  return caseFile.telemetry_events
    .filter((event) => event.is_key_evidence)
    .map((event, index) => ({
      id: `det-${caseFile.case_id}-${event.event_id}`,
      name: event.summary,
      severity: event.severity,
      confidence: confidenceForEvent(caseFile, event, index),
      tactic: tacticForEvent(event),
      matched_event_ids: [event.event_id],
      recommendation: recommendationForEvent(caseFile, event)
    }));
}

export default function DetectionsPage() {
  const [activeCase, setActiveCase] = useState<ScenarioCase | null>(readActiveCase);

  useEffect(() => {
    return subscribeToActiveCase(setActiveCase);
  }, []);

  const detections = useMemo(() => (activeCase ? buildDetections(activeCase) : []), [activeCase]);

  return (
    <div className="space-y-5">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Detection Engine</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
          Suspicious Activity Findings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          {activeCase
            ? `Active case analytics correlate the staged ${activeCase.scenario_family.toLowerCase()} telemetry into analyst-friendly findings and response guidance.`
            : "Stage an incident to activate the detection engine and populate analyst-friendly findings."}
        </p>
      </section>

      {detections.length ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {detections.map((detection, index) => (
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
      ) : (
        <section className="glass-panel grid min-h-[360px] place-items-center rounded-[24px] p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] border border-line bg-white/[0.03] text-zinc-500">
              <ShieldCheck aria-hidden size={22} />
            </div>
            <p className="technical mt-5 text-sm uppercase tracking-[0.28em] text-zinc-500">[ NO ACTIVE ANALYTICS ]</p>
            <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
              Detection cards stay cleared until a new investigation is staged.
            </p>
          </motion.div>
        </section>
      )}
    </div>
  );
}


