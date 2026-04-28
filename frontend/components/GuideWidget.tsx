"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Grip, Info, Play, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const routeTips: Record<string, string[]> = {
  "/": [
    "Lab Brief gives the big picture; this guide explains the controls.",
    "Use the floating Command Dock at the bottom center for navigation.",
    "Begin in Scenario Director, then follow the evidence through Telemetry, Detections, Timeline, and Reports."
  ],
  "/director": [
    "Scenario Director creates a fresh synthetic case with real-feeling clues and decoys.",
    "Read the briefing first, then select the evidence cards you think belong in the incident.",
    "Submit your finding to get a mentor-style debrief, score, missed clues, and prevention guidance."
  ],
  "/builder": [
    "New to cyber? Choose Insider Data Drift first; it is the easiest story to follow.",
    "Want the classic SOC case? Choose Credential Compromise.",
    "Intensity and Noise create nine training profiles per scenario.",
    "Run the simulation and watch the lime node show the active phase.",
    "Ask Live AI Analyst about the evidence you see."
  ],
  "/telemetry": [
    "Read the Pulse feed like a SOC event stream.",
    "Events are synthetic, but shaped like blue-team telemetry."
  ],
  "/detections": [
    "Each card shows what the engine matched and why it matters.",
    "Confidence increases as multiple signals line up."
  ],
  "/timeline": [
    "This reconstructs the attack story in analyst order.",
    "Use it to show cause, sequence, and escalation."
  ],
  "/reports": [
    "This is the handoff artifact for an analyst or manager.",
    "Generate the AI version when live AI is armed."
  ]
};

const builderLegend = [
  ["Glass node", "One clue checkpoint in the case, like auth pressure, DLP evidence, or outbound drift."],
  ["Lime border", "The clue currently being investigated during the timed replay."],
  ["Top-left icon", "The signal family: identity, endpoint, file, DLP, SaaS, or network."],
  ["Small dot", "Severity cue. Lime is suspicious; crimson is higher urgency."],
  ["Source label", "Where a defender would see the clue: auth, endpoint, fileshare, proxy, DLP."],
  ["Tactic pill", "The investigation category: Discovery, Collection, Exfiltration, and more."],
  ["Dashed lines", "The story path. Follow it to see how small clues become one incident."]
];

export function GuideWidget() {
  const pathname = usePathname();
  const [isClosed, setIsClosed] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tips = useMemo(() => routeTips[pathname] ?? routeTips["/"], [pathname]);

  if (isClosed) {
    return (
      <motion.button
        type="button"
        onClick={() => {
          setIsClosed(false);
          setIsCollapsed(false);
        }}
        initial={{ opacity: 0, scale: 0.8, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="focus-ring guide-glass fixed right-5 top-24 z-50 grid h-11 w-11 place-items-center rounded-full text-lg font-bold text-lime shadow-lime transition hover:scale-105 hover:brightness-110"
        aria-label="Open quick guide"
        title="Open quick guide"
      >
        ?
      </motion.button>
    );
  }

  return (
    <motion.aside
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="guide-glass fixed right-4 top-24 z-50 w-[min(calc(100vw-32px),370px)] overflow-hidden rounded-[24px]"
    >
      <div className="flex cursor-grab items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 active:cursor-grabbing">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-[14px] border border-lime/20 bg-lime/10 text-lime shadow-lime">
            <Info aria-hidden size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">README</p>
            <p className="technical text-[10px] uppercase tracking-[0.22em] text-zinc-500">quick reference</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Grip aria-hidden size={15} className="text-zinc-600" />
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="focus-ring grid h-8 w-8 place-items-center rounded-[12px] text-zinc-400 transition hover:bg-white/10 hover:text-ink"
            aria-label={isCollapsed ? "Expand guide" : "Collapse guide"}
          >
            {isCollapsed ? <ChevronDown aria-hidden size={16} /> : <ChevronUp aria-hidden size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setIsClosed(true)}
            className="focus-ring grid h-8 w-8 place-items-center rounded-[12px] text-zinc-400 transition hover:bg-crimson/10 hover:text-crimson"
            aria-label="Close guide"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed ? (
          <motion.div
            key="guide-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 bg-black/10 p-4">
              <div className="grid grid-cols-3 gap-2">
                {["Safe Lab", "Live AI", "Report"].map((label) => (
                  <div key={label} className="guide-glass-soft rounded-[14px] px-2 py-2 text-center">
                    <span className="technical text-[9px] uppercase tracking-[0.16em] text-lime">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm leading-6 text-zinc-300">
                A short operating guide for the lab. The AI creates a safe mock incident; you practice how defenders identify clues, read logs, and explain risk.
              </p>

              {pathname === "/builder" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="technical text-[10px] uppercase tracking-[0.2em] text-lime">Builder legend</p>
                    <span className="technical rounded-full border border-line bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-zinc-500">
                      node graph
                    </span>
                  </div>
                  {builderLegend.map(([label, copy]) => (
                    <div key={label} className="guide-glass-soft rounded-[14px] p-3">
                      <p className="text-sm font-semibold text-ink">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{copy}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              <ol className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={tip} className="guide-glass-soft flex gap-3 rounded-[16px] p-3">
                    <span className="technical mt-0.5 text-[11px] text-lime">0{index + 1}</span>
                    <span className="text-sm leading-5 text-zinc-300">{tip}</span>
                  </li>
                ))}
              </ol>

              <Link
                href="/director"
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-[16px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                <Play aria-hidden size={16} />
                Start Investigation
              </Link>

              <p className="technical text-center text-[9px] uppercase tracking-[0.18em] text-zinc-600">
                Drag me anywhere. Close me when ready.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.aside>
  );
}



