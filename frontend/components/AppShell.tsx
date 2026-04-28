"use client";

import clsx from "clsx";
import {
  Activity,
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Radar,
  Route,
  ShieldCheck
} from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { GuideWidget } from "@/components/GuideWidget";
import { PitchWidget } from "@/components/PitchWidget";
import { getAiStatus } from "@/lib/api";
import type { AIStatus } from "@/types/adversim";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/director", label: "Custom Lab", icon: BrainCircuit },
  { href: "/builder", label: "Builder", icon: Radar },
  { href: "/telemetry", label: "Telemetry", icon: Activity },
  { href: "/detections", label: "Detections", icon: ShieldCheck },
  { href: "/timeline", label: "Timeline", icon: Route },
  { href: "/reports", label: "Reports", icon: FileText }
];

function AIStatusPill() {
  const [status, setStatus] = useState<AIStatus>({
    mode: "fallback-ready",
    enabled: true,
    has_api_key: false,
    model: "checking",
    remaining_demo_calls: 0,
    message: "Checking AI readiness..."
  });

  useEffect(() => {
    getAiStatus().then(setStatus);
  }, []);

  const isLive = status.mode === "live-ready";
  const isLimited = status.mode === "limit-reached";

  return (
    <div
      className={`glass-panel hidden items-center gap-3 rounded-full px-4 py-2 lg:flex ${
        isLive ? "shadow-lime" : ""
      }`}
      title={status.message}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${
            isLive ? "animate-ping bg-lime opacity-40" : isLimited ? "bg-crimson opacity-40" : "bg-zinc-500 opacity-30"
          }`}
        />
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-lime" : isLimited ? "bg-crimson" : "bg-zinc-500"
          }`}
        />
      </span>
      <span className="technical text-xs uppercase tracking-[0.22em] text-zinc-300">
        {isLive ? "Live AI armed" : isLimited ? "AI limit reached" : "Fallback AI ready"}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <LayoutGroup id="adversim-shell">
      <div className="relative min-h-screen overflow-x-hidden pb-36">
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%),linear-gradient(90deg,rgba(223,255,0,0.03),transparent_28%,rgba(255,45,85,0.03))]" />

        <header className="sticky top-0 z-30 border-b border-line bg-obsidian/70 px-4 py-4 backdrop-blur-[20px] sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <Link href="/" className="focus-ring group flex items-center gap-3 rounded-md">
              <motion.div
                layoutId="brand-mark"
                className="grid h-10 w-10 place-items-center rounded-[10px] border border-line bg-panel/80 text-lime shadow-lime backdrop-blur-[20px]"
              >
                <ShieldCheck aria-hidden size={21} />
              </motion.div>
              <div>
                <p className="text-lg font-semibold tracking-normal text-ink">AdverSim</p>
                <p className="technical text-[11px] uppercase tracking-[0.28em] text-muted">Synthetic defense lab</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <div className="glass-panel hidden items-center gap-3 rounded-full px-4 py-2 md:flex">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
                </span>
                <ClipboardList aria-hidden size={15} className="text-lime" />
                <span className="technical text-xs uppercase tracking-[0.22em] text-zinc-300">
                  2 scenarios armed
                </span>
              </div>
              <AIStatusPill />
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        <PitchWidget />
        <GuideWidget />

        <footer className="pointer-events-none relative z-10 mx-auto max-w-3xl px-6 pb-3 text-center">
          <p className="technical text-[10px] leading-5 tracking-[0.2em] text-zinc-500">
            SAFETY BOUNDARY: SYNTHETIC LOGS ONLY. NO LIVE TARGETING, EXPLOITATION, MALWARE, CREDENTIAL THEFT, OR EVASION.
          </p>
          <p className="technical mt-1 text-[9px] leading-5 tracking-[0.22em] text-zinc-600">
            Generated Educational Simulation only. All names, data, and IPs are FAKE.
          </p>
        </footer>

        <nav className="fixed bottom-5 left-1/2 z-40 w-[min(calc(100%-24px),900px)] -translate-x-1/2">
          <div className="glass-panel flex items-center justify-between gap-1 rounded-[28px] p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={clsx(
                    "focus-ring relative flex h-12 flex-1 items-center justify-center gap-2 rounded-[20px] px-2 text-xs font-semibold transition sm:px-3",
                    isActive ? "text-obsidian" : "text-zinc-400 hover:text-ink"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="command-dock-active"
                      className="absolute inset-0 rounded-[20px] bg-lime shadow-lime"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <Icon aria-hidden className="relative z-10" size={18} />
                  <span className="relative z-10 hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </LayoutGroup>
  );
}





