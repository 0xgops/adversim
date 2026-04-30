"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Clipboard, FileText, RefreshCw } from "lucide-react";
import { generateAiReport } from "@/lib/api";
import { readActiveCase, subscribeToActiveCase } from "@/lib/active-case";
import type { AIResponse, ScenarioCase } from "@/types/adversim";

const IDLE_REPORT_MARKDOWN = "# Incident Report\n*Awaiting Case Completion*";

function getSessionId() {
  if (typeof window === "undefined") {
    return "local-session";
  }

  const storageKey = "adversim-ai-session";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const nextId = `analyst-session-${window.crypto.randomUUID()}`;
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

function buildCaseReport(caseFile: ScenarioCase) {
  return `# Incident Report

## Case Summary
Case ID: ${caseFile.case_id}
Title: ${caseFile.title}
Scenario Family: ${caseFile.scenario_family}
Severity: ${caseFile.severity}
Confidence: ${caseFile.confidence}%

## Mission Briefing
${caseFile.case_briefing}

## Affected Entity
- Target user: ${caseFile.target_user}
- Target host: ${caseFile.target_host}
- Actor profile: ${caseFile.attacker_profile}

## Key Evidence
${caseFile.telemetry_events
  .filter((event) => event.is_key_evidence)
  .map((event) => `- ${event.timestamp} | ${event.source} | ${event.summary}`)
  .join("\n")}

## Expected Findings
${caseFile.expected_findings.map((finding) => `- ${finding}`).join("\n")}

## Recommended Response
${caseFile.recommended_response.map((action) => `- ${action}`).join("\n")}

## Prevention Lessons
${caseFile.prevention_lessons.map((lesson) => `- ${lesson}`).join("\n")}
`;
}

export default function ReportsPage() {
  const [activeCase, setActiveCase] = useState<ScenarioCase | null>(readActiveCase);
  const [generatedReportMarkdown, setGeneratedReportMarkdown] = useState<string | null>(null);
  const [sessionId] = useState(getSessionId);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSource, setAiSource] = useState<AIResponse["source"]>("fallback");
  const [aiModel, setAiModel] = useState("idle");
  const [aiRemainingCalls, setAiRemainingCalls] = useState(0);

  useEffect(() => {
    return subscribeToActiveCase((nextCase) => {
      setActiveCase(nextCase);
      setGeneratedReportMarkdown(null);
      setAiSource("fallback");
      setAiModel(nextCase ? "case-report-local" : "idle");
      setAiRemainingCalls(0);
    });
  }, []);

  const reportMarkdown = useMemo(
    () => generatedReportMarkdown ?? (activeCase ? buildCaseReport(activeCase) : IDLE_REPORT_MARKDOWN),
    [activeCase, generatedReportMarkdown]
  );

  async function copyReport() {
    await navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function generateLiveReport() {
    if (!activeCase) {
      return;
    }

    setIsGenerating(true);
    const response = await generateAiReport(
      {
        session_id: sessionId,
        audience: "analyst"
      },
      fallbackAiReport(reportMarkdown)
    );

    setGeneratedReportMarkdown(response.text);
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
              {activeCase
                ? "Markdown first, tuned for a concise incident handoff and executive summary."
                : "The report surface is cleared until an investigation is staged and completed."}
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
            disabled={isGenerating || !activeCase}
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
              {aiSource === "live-openai" ? "OpenAI live" : aiSource === "cached" ? "cached AI" : "local fallback"} | {aiModel} | {aiRemainingCalls} calls left
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
