"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, GraduationCap, Grip, Layers3, Play, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

const trainingTracks = [
  ["The promise", "Can AI teach you to investigate a fake cyber incident in 60 seconds?"],
  ["Your role", "You are the analyst. Logs are clues, detections are patterns, the report is your answer."],
  ["Beginner path", "Start the guided investigation, then follow the Command Dock from left to right."],
  ["AI coach", "Ask the analyst what any clue means in plain English as the replay unfolds."]
];

export function PitchWidget() {
  const pathname = usePathname();
  const [isClosed, setIsClosed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (pathname !== "/") {
    return null;
  }

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
        className="focus-ring guide-glass fixed left-5 top-24 z-50 hidden h-11 w-11 place-items-center rounded-full text-lime shadow-lime transition hover:scale-105 hover:brightness-110 md:grid"
        aria-label="Reopen lab brief"
        title="Reopen lab brief"
      >
        <Sparkles aria-hidden size={18} />
      </motion.button>
    );
  }

  return (
    <motion.aside
      drag
      dragMomentum={false}
      initial={{ opacity: 0, x: -18, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.15 }}
      className="guide-glass fixed left-4 top-24 z-50 hidden w-[390px] overflow-hidden rounded-[24px] md:block"
    >
      <div className="flex cursor-grab items-center justify-between gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 active:cursor-grabbing">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-[14px] border border-lime/20 bg-lime/10 text-lime shadow-lime">
            <Sparkles aria-hidden size={17} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Lab Brief</p>
            <p className="technical text-[10px] uppercase tracking-[0.22em] text-zinc-500">start here</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Grip aria-hidden size={15} className="text-zinc-600" />
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="focus-ring grid h-8 w-8 place-items-center rounded-[12px] text-zinc-400 transition hover:bg-white/10 hover:text-ink"
            aria-label={isCollapsed ? "Expand lab brief" : "Collapse lab brief"}
          >
            {isCollapsed ? <ChevronDown aria-hidden size={16} /> : <ChevronUp aria-hidden size={16} />}
          </button>
          <button
            type="button"
            onClick={() => setIsClosed(true)}
            className="focus-ring grid h-8 w-8 place-items-center rounded-[12px] text-zinc-400 transition hover:bg-crimson/10 hover:text-crimson"
            aria-label="Close lab brief"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed ? (
          <motion.div
            key="pitch-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 bg-black/10 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="technical rounded-full border border-lime/30 bg-lime/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-lime">
                    Cybersecurity
                  </span>
                  <p className="technical text-xs uppercase tracking-[0.24em] text-lime">AI mock-incident lab</p>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal text-ink">
                  You are the analyst.
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  Ask AI to stage a safe mock cyber incident, then follow the clues until you can explain what happened and what to do next.
                </p>
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  The floating Command Dock at the bottom center is your lab console: Builder, Telemetry, Detections, Timeline, and Reports.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Live AI", Bot],
                  ["Tracks", Layers3],
                  ["Training", GraduationCap],
                  ["Replay", Play]
                ].map(([label, Icon]) => {
                  const TileIcon = Icon as LucideIcon;

                  return (
                    <div key={label as string} className="guide-glass-soft rounded-[14px] px-3 py-3">
                      <TileIcon aria-hidden size={15} className="text-lime" />
                      <p className="technical mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                        {label as string}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                {trainingTracks.map(([title, copy], index) => (
                  <div key={title} className="guide-glass-soft flex gap-3 rounded-[16px] p-3">
                    <span className="technical mt-0.5 text-[11px] text-lime">0{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/investigation"
                className="focus-ring flex h-11 items-center justify-center gap-2 rounded-[16px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                <Play aria-hidden size={16} />
                Start Investigation
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.aside>
  );
}


