"use client";

import { useEffect, useState } from "react";
import { Bot, Clipboard, FileText, RefreshCw } from "lucide-react";
import { generateAiReport, getLatestSimulation } from "@/lib/api";
import { simulation as fallbackSimulation } from "@/lib/mock-data";
import type { AIResponse, SimulationResult } from "@/types/adversim";

function getSessionId() {
  if (typeof window === "undefined") {
    return "local-demo";
  }

  const storageKey = "adversim-ai-session";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextId = `judge-demo-${window.crypto.randomUUID()}`;
  window.localStorage.setItem(storageKey, nextId);
  return nextId;
}

function fallbackAiReport(markdown: string): AIResponse {
  return {
    text: markdown,
    source: "fallback",
    model: "guarded-fallback",
    remaining_session_calls: 0,
    safety_note: "Synthetic defensive training only. No live targeting, exploitation, credential theft, malware, or evasion."
  };
}

export default function ReportsPage() {
  const [result, setResult] = useState<SimulationResult>(fallbackSimulation);
  const [reportMarkdown, setReportMarkdown] = useState(fallbackSimulation.report_markdown);
  const [sessionId] = useState(getSessionId);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSource, setAiSource] = useState<AIResponse["source"]>("fallback");
  const [aiModel, setAiModel] = useState("guarded-fallback");
  const [aiRemainingCalls, setAiRemainingCalls] = useState(0);

  useEffect(() => {
    getLatestSimulation().then((latest) => {
      setResult(latest);
      setReportMarkdown(latest.report_markdown);
    });
  }, []);

  async function copyReport() {
    await navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function generateLiveReport() {
    setIsGenerating(true);
    const response = await generateAiReport(
      {
        session_id: sessionId,
        audience: "judge"
      },
      fallbackAiReport(result.report_markdown)
    );

    setReportMarkdown(response.text);
    setAiSource(response.source);
    setAiModel(response.model);
    setAiRemainingCalls(response.remaining_session_calls);
    setIsGenerating(false);
  }

  return (
    <div className="space-y-5">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Reports</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-ink sm:text-5xl">
              Analyst-Ready Incident Report
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Markdown first, tuned for a concise incident handoff and executive summary.
            </p>
          </div>
          <button
            type="button"
            onClick={copyReport}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-[16px] border border-line bg-white/5 px-4 text-sm font-semibold text-ink transition hover:bg-white/10"
          >
            <Clipboard aria-hidden size={16} />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={generateLiveReport}
            disabled={isGenerating}
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-[16px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isGenerating ? <RefreshCw aria-hidden size={16} className="animate-spin" /> : <Bot aria-hidden size={16} />}
            Generate AI Report
          </button>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-[24px]">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-[16px] border border-line bg-lime/10 text-lime">
            <FileText aria-hidden size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">incident-report.md</h2>
            <p className="technical text-xs uppercase tracking-[0.2em] text-zinc-500">
              {aiSource === "live-openai" ? "OpenAI live" : aiSource === "cached" ? "cached AI" : "local fallback"} · {aiModel} · {aiRemainingCalls} calls left
            </p>
          </div>
        </div>
        <pre className="technical max-h-[680px] overflow-auto whitespace-pre-wrap bg-black/25 p-5 text-sm leading-7 text-zinc-200">
          {reportMarkdown}
        </pre>
      </section>
    </div>
  );
}
