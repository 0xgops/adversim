"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  BrainCircuit,
  Clock3,
  FileArchive,
  FileSearch,
  Fingerprint,
  GraduationCap,
  Gauge,
  LockKeyhole,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Signal,
  Terminal,
  Trophy
} from "lucide-react";
import { askAiAnalyst, getAiStatus, getScenarios } from "@/lib/api";
import { scenarios as fallbackScenarios, simulation as fallbackSimulation } from "@/lib/mock-data";
import Link from "next/link";
import { useLiveSimulation } from "@/components/LiveSimulationProvider";
import { useViewMode } from "@/components/ViewModeProvider";
import { ViewModeToggle } from "@/components/ViewModeToggle";
import { scenarioFamilies } from "@/lib/scenario-catalog";
import { generateScenarioCase } from "@/lib/scenario-director";
import type {
  AIResponse,
  AIStatus,
  EvidenceEvent,
  Scenario,
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  SimulationRequest,
  SimulationResult,
  TelemetryEvent
} from "@/types/adversim";
import type { LucideIcon } from "lucide-react";

const intensityOptions = ["Low", "Medium", "High"] as const;
const noiseOptions = ["Clean", "Realistic", "Noisy"] as const;
const durationOptions = ["15 minutes", "30 minutes", "1 hour"] as const;

const replaySecondsByDuration: Record<SimulationRequest["duration"], number> = {
  "15 minutes": 60,
  "30 minutes": 105,
  "1 hour": 150
};

const logCadenceMilliseconds = 2000;

type ChatMessage = {
  id: string;
  role: "analyst" | "user";
  text: string;
};

type LiveMetrics = {
  incidents: number;
  confidence: number;
  telemetry: number;
  timeline: number;
};

type ScheduledEvent = {
  event: TelemetryEvent;
  stageIndex: number;
  offsetMilliseconds: number;
};

type ScenarioStage = {
  id: string;
  title: string;
  detail: string;
  tactic: string;
  source: string;
  severity: TelemetryEvent["severity"];
  icon: LucideIcon;
  x: string;
  y: string;
};

type BuilderScenarioConfig = {
  id: string;
  title: string;
  subtitle: string;
  seed: string;
  why: [string, string][];
  quickPrompts: string[];
  stages: ScenarioStage[];
};

type VariantProfile = {
  name: string;
  lens: string;
  learnerGoal: string;
};

const defaultRequest: SimulationRequest = {
  scenario_id: "credential-compromise-chain",
  target_user: "finance.admin",
  target_host: "NYC-WKS-014",
  intensity: "Medium",
  duration: "30 minutes",
  noise_level: "Realistic"
};

function getInitialBuilderRequest(): SimulationRequest {
  if (typeof window === "undefined") {
    return defaultRequest;
  }

  return window.localStorage.getItem("adversim-guided-launch") === "true"
    ? { ...defaultRequest, duration: "15 minutes" }
    : defaultRequest;
}

function getInitialMissionBanner() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("adversim-guided-launch") === "true";
}

const variantProfiles: Record<string, VariantProfile> = {
  "Clean-Low": {
    name: "Guided First Case",
    lens: "Low pressure, minimal noise",
    learnerGoal: "Learn the basic shape of the incident without distraction."
  },
  "Clean-Medium": {
    name: "Focused Investigation",
    lens: "Clear signal, moderate stakes",
    learnerGoal: "Practice connecting the main clues into one timeline."
  },
  "Clean-High": {
    name: "High-Signal Escalation",
    lens: "Clear signal, urgent impact",
    learnerGoal: "Learn when a clean case still deserves fast escalation."
  },
  "Realistic-Low": {
    name: "Everyday SOC Triage",
    lens: "Normal business context, low pressure",
    learnerGoal: "Separate ordinary activity from the first suspicious clue."
  },
  "Realistic-Medium": {
    name: "SOC Training Default",
    lens: "Balanced signal, context, and urgency",
    learnerGoal: "Follow a realistic analyst workflow from logs to report."
  },
  "Realistic-High": {
    name: "Priority Incident",
    lens: "Realistic context, high urgency",
    learnerGoal: "Practice confidence-building when multiple systems agree."
  },
  "Noisy-Low": {
    name: "Needle Finder",
    lens: "Lots of background activity, low stakes",
    learnerGoal: "Learn not to panic when harmless events surround the clue."
  },
  "Noisy-Medium": {
    name: "Signal vs. Noise",
    lens: "Messy data, moderate urgency",
    learnerGoal: "Practice ignoring distractions and preserving the true story."
  },
  "Noisy-High": {
    name: "Triage Under Pressure",
    lens: "Messy data, urgent incident",
    learnerGoal: "Learn how defenders prioritize when everything feels loud."
  }
};

const credentialStages: ScenarioStage[] = [
  {
    id: "spray",
    title: "Auth pressure",
    detail: "Failed login pattern",
    tactic: "Credential Access",
    source: "auth",
    severity: "medium",
    icon: Fingerprint,
    x: "6%",
    y: "18%"
  },
  {
    id: "login",
    title: "Unusual success",
    detail: "New source sign-in",
    tactic: "Initial Access",
    source: "cloud",
    severity: "high",
    icon: LockKeyhole,
    x: "38%",
    y: "9%"
  },
  {
    id: "execution",
    title: "Admin shell signal",
    detail: "Endpoint process event",
    tactic: "Execution",
    source: "endpoint",
    severity: "high",
    icon: Terminal,
    x: "67%",
    y: "23%"
  },
  {
    id: "privilege",
    title: "Privilege attempt",
    detail: "Group change event",
    tactic: "Privilege Escalation",
    source: "identity",
    severity: "critical",
    icon: ShieldCheck,
    x: "18%",
    y: "58%"
  },
  {
    id: "discovery",
    title: "Discovery sweep",
    detail: "File access pattern",
    tactic: "Discovery",
    source: "endpoint",
    severity: "high",
    icon: Activity,
    x: "48%",
    y: "67%"
  },
  {
    id: "transfer",
    title: "Outbound pulse",
    detail: "Large transfer flag",
    tactic: "Exfiltration",
    source: "network",
    severity: "critical",
    icon: Signal,
    x: "74%",
    y: "56%"
  }
];

const insiderStages: ScenarioStage[] = [
  {
    id: "after-hours",
    title: "After-hours access",
    detail: "Sensitive folder touch",
    tactic: "Discovery",
    source: "fileshare",
    severity: "medium",
    icon: FileSearch,
    x: "6%",
    y: "18%"
  },
  {
    id: "access-burst",
    title: "Access burst",
    detail: "Metadata spike",
    tactic: "Collection",
    source: "fileshare",
    severity: "high",
    icon: Activity,
    x: "38%",
    y: "9%"
  },
  {
    id: "dlp-labels",
    title: "DLP labels",
    detail: "Sensitive category hit",
    tactic: "Collection",
    source: "dlp",
    severity: "high",
    icon: ShieldCheck,
    x: "67%",
    y: "23%"
  },
  {
    id: "archive",
    title: "Archive staging",
    detail: "Bundle prep signal",
    tactic: "Collection",
    source: "endpoint",
    severity: "high",
    icon: FileArchive,
    x: "18%",
    y: "58%"
  },
  {
    id: "share",
    title: "External share",
    detail: "SaaS audit event",
    tactic: "Exfiltration",
    source: "saas",
    severity: "critical",
    icon: LockKeyhole,
    x: "48%",
    y: "67%"
  },
  {
    id: "egress",
    title: "Volume drift",
    detail: "Outbound upload spike",
    tactic: "Exfiltration",
    source: "proxy",
    severity: "critical",
    icon: Signal,
    x: "74%",
    y: "56%"
  }
];

const scenarioConfigs: Record<string, BuilderScenarioConfig> = {
  "credential-compromise-chain": {
    id: "credential-compromise-chain",
    title: "Credential Compromise Chain",
    subtitle:
      "Ask AI to create a safe mock credential incident so you can practice identifying login clues, reading logs, and writing the response.",
    seed:
      "[AI Analyst]: Ask about auth pressure, suspicious shell activity, privilege changes, discovery, or outbound transfer. I will explain what the synthetic telemetry means and which detection it supports.",
    quickPrompts: ["Explain auth evidence", "Draft triage note"],
    why: [
      [
        "Telemetry pattern",
        "Repeated authentication pressure followed by endpoint and network signals is critical because it can reveal account misuse before broader access occurs."
      ],
      [
        "Analyst strategic insight",
        "Correlating identity, endpoint, and egress telemetry helps a junior SOC analyst turn isolated alerts into one defensible incident narrative."
      ],
      ["Recommended workflow", "Review Telemetry, validate Detections, reconstruct the Timeline, then generate the Report from the Command Dock."]
    ],
    stages: credentialStages
  },
  "insider-data-drift": {
    id: "insider-data-drift",
    title: "Insider Data Drift",
    subtitle:
      "Ask AI to create a safe mock data-risk incident so you can practice spotting file, DLP, sharing, and upload clues.",
    seed:
      "[AI Analyst]: Ask about after-hours access, DLP labels, archive staging, external sharing, or egress drift. I will explain the insider-risk evidence in beginner-friendly language.",
    quickPrompts: ["Explain DLP evidence", "Summarize insider risk"],
    why: [
      [
        "Telemetry pattern",
        "Sensitive file access followed by staging, external sharing, and outbound drift is critical because it can indicate data exposure before confirmation arrives."
      ],
      [
        "Analyst strategic insight",
        "A junior SOC analyst should compare the activity against business context, user baseline, and policy signals before assigning intent."
      ],
      ["Recommended workflow", "Review Detections and Timeline to see how file, DLP, SaaS, and proxy signals become one case."]
    ],
    stages: insiderStages
  }
};

const connectorLines = [
  ["17%", "28%", "46%", "20%"],
  ["50%", "22%", "73%", "32%"],
  ["74%", "43%", "31%", "64%"],
  ["35%", "66%", "55%", "72%"],
  ["61%", "73%", "79%", "63%"]
];

function getBuilderScenario(scenarioId: string) {
  return scenarioConfigs[scenarioId] ?? scenarioConfigs["credential-compromise-chain"];
}

function getVariantProfile(request: SimulationRequest) {
  return variantProfiles[`${request.noise_level}-${request.intensity}`] ?? variantProfiles["Realistic-Medium"];
}

const analystSeed: ChatMessage[] = [
  {
    id: "seed-1",
    role: "analyst",
    text: scenarioConfigs["credential-compromise-chain"].seed
  }
];

function delay(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function waitUntil(targetTime: number) {
  return delay(Math.max(0, targetTime - performance.now()));
}

function readReplayClock() {
  return window.performance.now();
}

function makeInteractionId(prefix: string) {
  return `${prefix}-${window.crypto.randomUUID()}`;
}

function GlassCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`glass-panel rounded-[24px] ${className}`}>{children}</section>;
}

function SeverityDot({ severity, active }: { severity: string; active: boolean }) {
  const isCritical = severity === "critical";

  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${
          isCritical ? "bg-crimson" : "bg-lime"
        } ${active ? "animate-ping opacity-60" : "opacity-20"}`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isCritical ? "bg-crimson" : "bg-lime"}`} />
    </span>
  );
}

function ControlSlider({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: number;
  options: readonly string[];
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <span className="technical rounded-full border border-line bg-white/5 px-2.5 py-1 text-xs text-lime">
          {options[value]}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={options.length - 1}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-pro"
      />
      <div className="technical flex justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500">
        {options.map((option) => (
          <span key={option}>{option}</span>
        ))}
      </div>
    </div>
  );
}

function makeEvent(
  stageIndex: number,
  eventIndex: number,
  source: string,
  eventType: string,
  message: string,
  severity: TelemetryEvent["severity"],
  request: SimulationRequest
): TelemetryEvent {
  return {
    id: `sim-${stageIndex + 1}${eventIndex + 1}-${Date.now()}`,
    timestamp: new Date(Date.now() + stageIndex * 60_000 + eventIndex * 12_000).toISOString(),
    source,
    event_type: eventType,
    user: request.target_user,
    host: request.target_host,
    message,
    severity,
    tags: [
      "simulated",
      "educational",
      getBuilderScenario(request.scenario_id).stages[stageIndex]?.tactic.toLowerCase().replaceAll(" ", "-") ?? "training"
    ]
  };
}

function buildStageEvents(stageIndex: number, request: SimulationRequest): TelemetryEvent[] {
  const fakeUser = "lisa.chen@adversim.co";
  const backupUser = "marcus.reed@adversim.co";
  const host = request.target_host || "NYC-WKS-014";
  const peerHost = host === "NYC-WKS-014" ? "NYC-WKS-015" : "NYC-WKS-014";
  const simulatedPath = String.raw`C:\ProgramData\Intel\Core\IntelUpd.exe`;
  const shellPath = String.raw`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`;
  const noiseLevel = request.noise_level;
  const intensity = request.intensity;

  if (request.scenario_id === "insider-data-drift") {
    const fileCount = request.intensity === "High" ? 178 : request.intensity === "Medium" ? 134 : 88;
    const transferMb = request.intensity === "High" ? 460 : request.intensity === "Medium" ? 320 : 180;

    const insiderEventsByStage: TelemetryEvent[][] = [
      [
        makeEvent(0, 0, "fileshare", "after_hours_access", `Event ID 4663: ${request.target_user} accessed \\\\fileshare\\HR\\Compensation from ${host} outside normal working hours.`, "medium", request),
        makeEvent(0, 1, "fileshare", "baseline_delta", `Access baseline: ${request.target_user} normally reads finance workpapers during business hours; HR path is off-pattern.`, "medium", request),
        makeEvent(0, 2, "identity", "peer_context", `${backupUser} shows routine access to the same business unit, helping analysts compare peer behavior.`, "low", request),
        makeEvent(0, 3, "siem", "first_seen_path", `SIEM note: first observed access to compensation planning folders from ${host} in 45 days.`, "medium", request)
      ],
      [
        makeEvent(1, 0, "fileshare", "access_burst", `File server metric: ${fileCount} metadata reads across HR and Finance folders in 4 minutes.`, "high", request),
        makeEvent(1, 1, "fileshare", "extension_mix", `Extension mix: spreadsheet, PDF, and archive-like filenames observed in the same burst; content remains lab-only.`, "medium", request),
        makeEvent(1, 2, "ueba", "working_set_delta", `UEBA delta: accessed file categories differ from ${request.target_user}'s normal working set by 71%.`, "high", request),
        makeEvent(1, 3, "siem", "collection_hint", `Correlation hint: after-hours folder touch escalated into broad collection-like behavior.`, "high", request)
      ],
      [
        makeEvent(2, 0, "dlp", "sensitive_label_match", `DLP classifier matched payroll, compensation, and quarterly-planning labels in the access pattern.`, "high", request),
        makeEvent(2, 1, "dlp", "policy_context", `Policy context: labels are sensitive but not restricted by malware logic; this is data-handling triage.`, "medium", request),
        makeEvent(2, 2, "case", "evidence_merge", `Case evidence merged file access burst with DLP labels for analyst review.`, "high", request),
        makeEvent(2, 3, "dlp", "confidence_delta", `DLP confidence increased because multiple sensitive categories were touched in one sequence.`, "high", request)
      ],
      [
        makeEvent(3, 0, "endpoint", "archive_staging", `Temporary archive staging observed on ${host}; filenames resemble HR and finance exports.`, "high", request),
        makeEvent(3, 1, "endpoint", "local_path_context", `Endpoint context: staging path C:\\Users\\Public\\Documents\\ReviewCache is represented as inert lab telemetry.`, "high", request),
        makeEvent(3, 2, "edr", "user_action_context", `EDR note: activity looks like user-driven file preparation, not code execution or malware behavior.`, "medium", request),
        makeEvent(3, 3, "siem", "sequence_context", `Sequence links after-hours access -> collection burst -> sensitive labels -> archive staging.`, "high", request)
      ],
      [
        makeEvent(4, 0, "saas-audit", "external_share", `External share created for finance-review-bundle.zip to review-drop.adversim.test; lab-only destination.`, "critical", request),
        makeEvent(4, 1, "saas-audit", "permission_delta", `Sharing permission changed from internal-only to external viewer for the staged bundle.`, "critical", request),
        makeEvent(4, 2, "dlp", "share_policy_match", `DLP share policy matched sensitive labels leaving the internal collaboration boundary.`, "critical", request),
        makeEvent(4, 3, "case", "triage_priority", `Triage priority increased because external sharing followed collection and staging behavior.`, "critical", request)
      ],
      [
        makeEvent(5, 0, "proxy", "egress_volume_drift", `Proxy summary: ${transferMb} MB outbound upload from ${host}; exceeds normal working-set baseline.`, "critical", request),
        makeEvent(5, 1, "netflow", "upload_ratio", `NetFlow ratio: upload volume exceeded download volume by 9x during the sharing window.`, "critical", request),
        makeEvent(5, 2, "case", "insider_rollup", `Case rollup: unusual access, sensitive labels, archive staging, external share, and egress drift merged into one incident.`, "critical", request),
        makeEvent(5, 3, "mentor", "learning_note", `Learning note: insider-risk investigations focus on context, authorization, and policy review rather than assuming malicious intent.`, "low", request)
      ]
    ];

    if (noiseLevel === "Realistic" && stageIndex >= 3) {
      insiderEventsByStage[stageIndex].push(
        makeEvent(
          stageIndex,
          4,
          "context",
          "business_background",
          `Business context: routine collaboration from ${peerHost} overlaps the case window; useful for teaching balanced triage.`,
          "info",
          request
        )
      );
    }

    if (noiseLevel === "Noisy" && stageIndex >= 1) {
      insiderEventsByStage[stageIndex].push(
        makeEvent(
          stageIndex,
          4,
          "noise",
          "benign_collaboration",
          `Background collaboration event from ${peerHost}; retained to teach analysts how to separate policy risk from normal teamwork.`,
          "info",
          request
        )
      );

      if (intensity === "High" && stageIndex >= 3) {
        insiderEventsByStage[stageIndex].push(
          makeEvent(
            stageIndex,
            5,
            "noise",
            "benign_admin_task",
            `Background admin task on ${host}; included so learners practice not treating every loud event as malicious.`,
            "info",
            request
          )
        );
      }
    }

    return insiderEventsByStage[stageIndex];
  }

  const eventsByStage: TelemetryEvent[][] = [
    [
      makeEvent(0, 0, "auth", "failed_login", `Event ID 4625: Failed logon for ${fakeUser} from 192.168.1.101 against ${host}.`, "medium", request),
      makeEvent(0, 1, "auth", "failed_login", `Event ID 4625: Second failed logon for ${request.target_user}; source pattern resembles password-spray pressure.`, "medium", request),
      makeEvent(0, 2, "auth", "failed_login", `Event ID 4625: Failed logon for ${backupUser} from 192.168.1.104; same source ASN grouping as prior failures.`, "medium", request),
      makeEvent(0, 3, "siem", "correlation_hint", `SIEM correlation: 5 authentication failures across 2 usernames in a compressed time window; analyst note attached.`, "low", request),
      makeEvent(0, 4, "identity", "baseline_delta", `Identity baseline: ${request.target_user} normally signs in from 192.168.1.23 during business hours; current pattern is off-baseline.`, "low", request)
    ],
    [
      makeEvent(1, 0, "cloud-login", "successful_login", `Event ID 4624: Account Logon Success for ${request.target_user} from 198.51.100.44; geo/device context is unusual.`, "high", request),
      makeEvent(1, 1, "identity", "session_risk", `Conditional access note: ${fakeUser} and ${request.target_user} show overlapping login windows from distinct network zones.`, "medium", request),
      makeEvent(1, 2, "iam", "mfa_context", `MFA context: remembered-device token changed for ${request.target_user}; lab signal increases Initial Access suspicion.`, "medium", request),
      makeEvent(1, 3, "cloud-login", "device_context", `Device posture: login session claims Windows workstation but user-agent fingerprint differs from ${host} baseline.`, "medium", request),
      makeEvent(1, 4, "siem", "impossible_travel_check", `Travel check: prior session from 192.168.1.23 and current source 198.51.100.44 are incompatible in the training window.`, "high", request)
    ],
    [
      makeEvent(2, 0, "endpoint", "process_activity", `Event ID 4104: ${shellPath} launched on ${host} with a lab-only policy-override flag and non-operational training arguments.`, "high", request),
      makeEvent(2, 1, "endpoint", "process_metadata", `Process path observed: ${simulatedPath}; unsigned lab artifact label attached for analyst training.`, "high", request),
      makeEvent(2, 2, "edr", "parent_child_context", `EDR lineage: office-app.exe spawned administrative shell telemetry; used here only as a defensive training pattern.`, "high", request),
      makeEvent(2, 3, "endpoint", "script_block_context", `Script block metadata: encoded-looking parameters were normalized and stored as inert training text for analyst review.`, "high", request),
      makeEvent(2, 4, "edr", "command_frequency", `Command frequency: ${intensity === "High" ? 14 : intensity === "Medium" ? 9 : 4} administrative shell events in 90 seconds compared with a workstation baseline of 0-1.`, "medium", request)
    ],
    [
      makeEvent(3, 0, "identity", "privilege_change_attempt", `Event ID 4732: ${request.target_user} attempted privileged group membership modification; change was blocked by lab policy.`, "critical", request),
      makeEvent(3, 1, "authz", "admin_scope_check", `Access review: ${backupUser} has normal baseline; ${request.target_user} deviates from expected finance workstation behavior.`, "high", request),
      makeEvent(3, 2, "identity", "risk_score_delta", `Risk score delta: identity confidence increased after privilege attempt followed endpoint execution.`, "critical", request),
      makeEvent(3, 3, "directory", "group_policy_context", `Directory context: admin-group write request was denied; policy engine retained the attempted target group and actor.`, "critical", request),
      makeEvent(3, 4, "siem", "rule_match", `Detection match: privileged modification attempt occurred after unusual login and endpoint execution within the correlation window.`, "critical", request)
    ],
    [
      makeEvent(4, 0, "endpoint", "file_discovery", `Event ID 4663: Repeated reads against \\\\fileshare\\Finance\\Quarterly from ${host}; pattern resembles discovery and collection prep.`, "high", request),
      makeEvent(4, 1, "edr", "sequence_context", `EDR sequence links unusual login -> shell activity -> sensitive directory enumeration on ${peerHost}.`, "high", request),
      makeEvent(4, 2, "dlp", "classification_context", `DLP classifier: finance exports and payroll-like filenames observed in access pattern; no real files touched.`, "medium", request),
      makeEvent(4, 3, "fileshare", "access_burst", `File server metric: 148 metadata reads in 2 minutes from ${host}; normal median for this user is 12.`, "high", request),
      makeEvent(4, 4, "endpoint", "archive_prep_context", `Archive prep signal: temporary staging folder name matched finance-export naming convention; content remains synthetic.`, "high", request)
    ],
    [
      makeEvent(5, 0, "network", "large_outbound_transfer", `Firewall analytic: ${intensity === "High" ? 920 : intensity === "Medium" ? 684 : 260} MB outbound transfer from ${host} to 203.0.113.88; destination is reserved lab IP space.`, "critical", request),
      makeEvent(5, 1, "network", "dns_context", `DNS note: finance-archive-sync.adversim.test observed during transfer window; lab-only domain.`, "critical", request),
      makeEvent(5, 2, "proxy", "egress_context", `Proxy summary: sustained egress above baseline from ${host}; detection narrative now ready for report generation.`, "critical", request),
      makeEvent(5, 3, "netflow", "volume_delta", `NetFlow delta: outbound bytes exceeded 14x host baseline after discovery phase; analyst confidence increased.`, "critical", request),
      makeEvent(5, 4, "case", "incident_rollup", `Case rollup: credential access, execution, privilege activity, discovery, and egress signals merged into one critical incident.`, "critical", request)
    ]
  ];

  if (noiseLevel === "Realistic" && stageIndex >= 4) {
    eventsByStage[stageIndex].push(
      makeEvent(
        stageIndex,
        5,
        "context",
        "normal_business_activity",
        `Normal business event from ${peerHost} overlaps the alert window; included to make the case feel like a real SOC queue.`,
        "info",
        request
      )
    );
  }

  if (noiseLevel === "Noisy" && stageIndex >= 2) {
    eventsByStage[stageIndex].push(
      makeEvent(
        stageIndex,
        5,
        "noise",
        "benign_background",
        `Background noise: software inventory heartbeat from ${peerHost}; retained to teach analysts signal-versus-noise triage.`,
        "info",
        request
      )
    );

    if (intensity === "High" && stageIndex >= 4) {
      eventsByStage[stageIndex].push(
        makeEvent(
          stageIndex,
          6,
          "noise",
          "benign_patch_signal",
          `Patch-management heartbeat from ${peerHost}; noisy profile teaches analysts to keep the true incident sequence in focus.`,
          "info",
          request
        )
      );
    }
  }

  return eventsByStage[stageIndex];
}

function PulseLog({ event, index, active }: { event: EvidenceEvent; index: number; active: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.28, delay: index * 0.02 }}
      className={`rounded-[14px] border border-line bg-black/30 px-3 py-3 ${
        active ? "log-glow shadow-lime" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="technical text-[11px] text-lime">{event.timestamp}</span>
        <span className="technical text-[10px] uppercase tracking-[0.22em] text-zinc-500">{event.source}</span>
      </div>
      <p className="technical mt-2 text-xs leading-5 text-zinc-200">{event.summary}</p>
    </motion.li>
  );
}

function buildAnalystReply(
  prompt: string,
  activeStageIndex: number,
  metrics: LiveMetrics,
  scenarioConfig: BuilderScenarioConfig
): string {
  const normalizedPrompt = prompt.toLowerCase();

  if (scenarioConfig.id === "insider-data-drift") {
    if (normalizedPrompt.includes("dlp") || normalizedPrompt.includes("label") || normalizedPrompt.includes("sensitive")) {
      return "[AI Analyst]: DLP evidence is a teaching signal that sensitive categories were touched together. The key lesson is context: file labels, volume, timing, and whether the access matches the user's role.";
    }

    if (normalizedPrompt.includes("share") || normalizedPrompt.includes("external")) {
      return "[AI Analyst]: The external share event matters because it follows access burst and archive staging signals. For blue teams, the priority is to confirm authorization, preserve SaaS audit logs, and review sharing scope.";
    }

    if (normalizedPrompt.includes("egress") || normalizedPrompt.includes("upload") || normalizedPrompt.includes("proxy")) {
      return "[AI Analyst]: Egress drift means outbound upload volume rose above the user's baseline. In this scenario, it is strongest when paired with DLP labels and an external share event.";
    }

    if (normalizedPrompt.includes("insider") || normalizedPrompt.includes("risk") || normalizedPrompt.includes("file")) {
      return "[AI Analyst]: Insider-risk triage should avoid jumping straight to blame. The defensible workflow is to compare baseline behavior, validate business context, preserve evidence, and escalate according to policy.";
    }
  }

  if (normalizedPrompt.includes("shell") || normalizedPrompt.includes("process") || normalizedPrompt.includes("4104")) {
    return "[AI Analyst]: For 'Suspicious Administrative Shell Activity,' lisa.chen@adversim.co is represented as launching C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe on NYC-WKS-014 with a lab-only policy-override flag. This is not executable guidance; it teaches analysts to connect script-block logging to the Execution detection.";
  }

  if (normalizedPrompt.includes("priv") || normalizedPrompt.includes("admin") || normalizedPrompt.includes("4732")) {
    return "[AI Analyst]: The privilege phase uses fake Event ID 4732-style telemetry. The teaching point is that a group-change attempt immediately after unusual login and endpoint activity should raise confidence for the Privilege Escalation detection.";
  }

  if (normalizedPrompt.includes("exfil") || normalizedPrompt.includes("transfer") || normalizedPrompt.includes("network")) {
    return "[AI Analyst]: The outbound transfer is fake lab data: 203.0.113.88 is reserved documentation space. The important blue-team lesson is sequence correlation: discovery activity plus large egress volume increases confidence for Exfiltration.";
  }

  if (normalizedPrompt.includes("user") || normalizedPrompt.includes("auth") || normalizedPrompt.includes("4624")) {
    return "[AI Analyst]: Authentication pressure starts with fake Event ID 4625 failures, then a 4624-style success from an unusual source. That pattern supports the 'Repeated Authentication Failures Followed by Success' detection.";
  }

  return `[AI Analyst]: Current phase is ${scenarioConfig.stages[activeStageIndex].tactic}. The lab has emitted ${metrics.telemetry} synthetic events, ${metrics.incidents} incident clusters, and ${metrics.confidence}% confidence. Ask about the active evidence to see a blue-team interpretation.`;
}

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

function makeFallbackAiResponse(text: string): AIResponse {
  return {
    text,
    source: "fallback",
    model: "guarded-fallback",
    remaining_session_calls: 0,
    safety_note: "Synthetic defensive training only. No live targeting, exploitation, credential theft, malware, or evasion."
  };
}

function sourceLabel(source: AIResponse["source"]) {
  if (source === "live-openai") {
    return "OpenAI live";
  }

  if (source === "cached") {
    return "cached answer";
  }

  return "guarded fallback";
}

function scenarioFamilyForBuilder(scenarioId: string): ScenarioFamily {
  return scenarioId === "insider-data-drift" ? "Insider Data Drift" : "Credential Compromise";
}

function difficultyForIntensity(intensity: SimulationRequest["intensity"]): ScenarioDifficulty {
  if (intensity === "High") {
    return "Intermediate";
  }

  return "Beginner";
}

function randomnessForNoise(noiseLevel: SimulationRequest["noise_level"]): ScenarioRandomness {
  if (noiseLevel === "Clean") {
    return "Low";
  }

  if (noiseLevel === "Noisy") {
    return "Chaos Lab";
  }

  return "Medium";
}

function evidenceToTelemetry(event: EvidenceEvent): TelemetryEvent {
  return {
    id: event.event_id,
    timestamp: new Date().toISOString(),
    source: event.source,
    event_type: event.tags[0] ?? "synthetic_evidence",
    user: event.user,
    host: event.host,
    message: event.summary,
    severity: event.severity.toLowerCase() as TelemetryEvent["severity"],
    tags: event.tags
  };
}

export default function BuilderPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(fallbackScenarios);
  const [request, setRequest] = useState<SimulationRequest>(getInitialBuilderRequest);
  const [result] = useState<SimulationResult>(fallbackSimulation);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(analystSeed);
  const [chatInput, setChatInput] = useState("");
  const [sessionId] = useState(getSessionId);
  const builderCaseCounterRef = useRef(100);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiSource, setAiSource] = useState<AIResponse["source"]>("fallback");
  const [aiModel, setAiModel] = useState("guarded-fallback");
  const [aiRemainingCalls, setAiRemainingCalls] = useState(0);
  const [aiStatusMessage, setAiStatusMessage] = useState("Checking AI readiness...");
  const [aiStatusMode, setAiStatusMode] = useState<AIStatus["mode"]>("fallback-ready");
  const { isSocView } = useViewMode();
  const {
    currentCase,
    streamedEvents,
    isStreaming,
    progress,
    activeStageIndex,
    completed: streamCompleted,
    startSimulation
  } = useLiveSimulation();
  const audienceMode = isSocView ? "soc" : "beginner";
  const [showMissionBanner, setShowMissionBanner] = useState(getInitialMissionBanner);
  const [autoDebrief, setAutoDebrief] = useState<AIResponse | null>(null);
  const [isAutoBriefing, setIsAutoBriefing] = useState(false);

  useEffect(() => {
    getScenarios().then(setScenarios);
    getAiStatus(sessionId).then((status) => {
      setAiStatusMode(status.mode);
      setAiStatusMessage(status.message);
      setAiSource(status.mode === "live-ready" ? "live-openai" : "fallback");
      setAiModel(status.mode === "fallback-ready" && !status.has_api_key ? "guarded-fallback" : status.model);
      setAiRemainingCalls(Number(status.remaining_session_calls ?? 0));
    });

    window.localStorage.removeItem("adversim-guided-launch");
  }, [sessionId]);

  const intensityValue = intensityOptions.indexOf(request.intensity);
  const noiseValue = noiseOptions.indexOf(request.noise_level);
  const replaySeconds = replaySecondsByDuration[request.duration];
  const scenarioConfig = getBuilderScenario(request.scenario_id);
  const variantProfile = getVariantProfile(request);
  const chainStages = scenarioConfig.stages;
  const pulseLogs = streamedEvents.slice(0, 12);
  const activeStreamCase = currentCase;
  const showCompletionCard = streamCompleted && Boolean(activeStreamCase);
  const metrics: LiveMetrics = {
    incidents: activeStreamCase?.key_evidence_event_ids.length ?? 0,
    confidence: activeStreamCase?.confidence ?? 0,
    telemetry: streamedEvents.length,
    timeline: activeStreamCase?.chartData.mappedTactics.filter((count) => count > 0).length ?? 0
  };
  const selectableScenarios = scenarios.filter((scenario) =>
    ["credential-compromise-chain", "insider-data-drift"].includes(scenario.id)
  );

  function handleRun() {
    setShowMissionBanner(false);
    setAutoDebrief(null);
    setIsAutoBriefing(false);
    setChatMessages((current) => [
      {
        id: makeInteractionId("run"),
        role: "analyst",
        text: "[AI Analyst]: Global live stream started. You can switch tabs while the event bus keeps pushing telemetry, detections, timeline nodes, and dashboard chart updates."
      },
      ...current.slice(0, 3)
    ]);

    builderCaseCounterRef.current += 1;

    const nextCase = generateScenarioCase({
      family: scenarioFamilyForBuilder(request.scenario_id),
      difficulty: difficultyForIntensity(request.intensity),
      randomness: randomnessForNoise(request.noise_level),
      trainingMode: "Guided",
      seed: `${request.scenario_id}:${request.target_user}:${request.target_host}:${makeInteractionId("builder")}`,
      caseNumber: builderCaseCounterRef.current,
      procedural: true,
      realtime: true
    });

    startSimulation(nextCase, {
      durationMs: replaySecondsByDuration[request.duration] * 1000,
      stageCount: chainStages.length
    });
  }

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = chatInput.trim();
    if (!trimmedInput) {
      return;
    }

    const now = makeInteractionId("chat");
    const pendingId = `analyst-pending-${now}`;
    const fallback = makeFallbackAiResponse(buildAnalystReply(trimmedInput, activeStageIndex, metrics, scenarioConfig));

    setChatMessages((current) => [
      {
        id: `user-${now}`,
        role: "user",
        text: `[YOU]: ${trimmedInput}`
      },
      {
        id: pendingId,
        role: "analyst",
        text: "[Live AI Analyst]: Reading the current synthetic evidence..."
      },
      ...current
    ]);
    setChatInput("");
    setIsAiThinking(true);

    const response = await askAiAnalyst(
      {
        prompt: trimmedInput,
        active_phase: chainStages[activeStageIndex]?.tactic ?? chainStages[0].tactic,
        session_id: sessionId,
        telemetry: pulseLogs.slice(0, 8).map(evidenceToTelemetry),
        detections: result.detections
      },
      fallback
    );

    setAiSource(response.source);
    setAiModel(response.model);
    setAiRemainingCalls(response.remaining_session_calls);
    setAiStatusMode(response.source === "live-openai" ? "live-ready" : "fallback-ready");
    setAiStatusMessage(
      response.source === "live-openai"
        ? "Live OpenAI analyst responded successfully."
        : response.source === "cached"
          ? "Cached AI response served instantly."
          : "Guarded fallback responded. Live AI is configured, but this request fell back safely."
    );
    setChatMessages((current) =>
      current.map((message) =>
        message.id === pendingId
          ? {
              ...message,
              text: response.text
            }
          : message
      )
    );
    setIsAiThinking(false);
  }

  return (
    <div className={`space-y-6 ${isSocView ? "soc-dense-stack" : ""}`}>
      {showMissionBanner ? (
        <motion.section
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="guide-glass rounded-[28px] p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="technical rounded-full border border-lime/35 bg-lime/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-lime">
                  Cybersecurity
                </span>
                <span className="technical text-xs uppercase tracking-[0.24em] text-zinc-500">guided investigation</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-ink">You are the analyst. Start here.</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Run the mock simulation, watch synthetic logs appear, ask AI what the clues mean, then use the Command Dock to open Detections, Timeline, and Reports.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRun}
              disabled={isStreaming}
              className="focus-ring flex h-12 items-center gap-2 rounded-[16px] bg-lime px-5 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110 disabled:bg-zinc-700"
            >
              <Play aria-hidden size={17} />
              Start Replay
            </button>
          </div>
        </motion.section>
      ) : null}

      {showCompletionCard ? (
        <motion.section
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="guide-glass rounded-[28px] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-lime">
                <Trophy aria-hidden size={19} />
                <p className="technical text-xs uppercase tracking-[0.24em]">Replay complete</p>
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-ink">Case staged. Investigation ready.</h2>
            </div>
            <span className="technical rounded-full border border-crimson/30 bg-crimson/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-crimson">
              {activeStreamCase?.severity ?? "High"} severity
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {[
              ["Detections", activeStreamCase?.key_evidence_event_ids.length ?? 0],
              ["Confidence", `${activeStreamCase?.confidence ?? 0}%`],
              ["Telemetry", activeStreamCase?.telemetry_events.length ?? 0],
              ["Timeline", activeStreamCase?.chartData.mappedTactics.filter((count) => count > 0).length ?? 0]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[18px] border border-line bg-black/25 p-4">
                <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[20px] border border-lime/25 bg-lime/[0.06] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-lime/25 bg-lime/10 text-lime shadow-lime">
                  {isAutoBriefing ? <RefreshCw aria-hidden size={18} className="animate-spin" /> : <BrainCircuit aria-hidden size={18} />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Auto AI Debrief</p>
                  <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                    {isAutoBriefing ? "analyzing replay context" : autoDebrief ? sourceLabel(autoDebrief.source) : "queued"}
                  </p>
                </div>
              </div>
              {autoDebrief ? (
                <span className="technical rounded-full border border-line bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-300">
                  {autoDebrief.model}
                </span>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
              {isAutoBriefing
                ? "AI is reviewing the synthetic detections, timeline, and report context without waiting for a prompt."
                : autoDebrief?.text ?? "The global event bus finished streaming. Open the Dashboard to investigate the active case, charts, detections, timeline, and report."}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-[15px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
            >
              Launch Active Investigation -&gt;
            </Link>
            <Link
              href="/timeline"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-[15px] border border-line bg-white/5 px-4 text-sm font-semibold text-ink transition hover:border-lime/40"
            >
              Open Timeline
            </Link>
            <Link
              href="/reports"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-[15px] border border-line bg-white/5 px-4 text-sm font-semibold text-ink transition hover:border-lime/40"
            >
              Generate Report
            </Link>
          </div>
        </motion.section>
      ) : null}

      <motion.section
        layoutId="builder-hero"
        className="grid gap-5 lg:grid-cols-[1fr_360px]"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <GlassCard className="relative overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="technical rounded-full border border-lime/35 bg-lime/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-lime shadow-lime">
                  Cybersecurity
                </span>
                <span className="technical inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-lime" />
                  Simulation Replay
                </span>
                <p className="technical text-xs uppercase tracking-[0.32em] text-lime">Mock Incident Builder</p>
              </div>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-ink sm:text-5xl lg:text-6xl">
                {scenarioConfig.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                {scenarioConfig.subtitle}
              </p>
              <ViewModeToggle className="mt-4" />
              <div className="mt-3 flex max-w-2xl gap-3 rounded-[18px] border border-line bg-black/25 p-3">
                {audienceMode === "beginner" ? (
                  <GraduationCap aria-hidden size={18} className="mt-0.5 shrink-0 text-lime" />
                ) : (
                  <ShieldCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-lime" />
                )}
                <p className="text-sm leading-6 text-zinc-300">
                  {audienceMode === "beginner"
                    ? "Plain-English mode: each box is a clue, the lime border shows the clue happening now, and the AI Analyst explains what the clue means."
                    : "SOC mode: tune the scenario, review phase telemetry, validate detections, reconstruct sequence, and generate the incident handoff."}
                </p>
              </div>
            </div>
            <div className="technical rounded-full border border-line bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300">
              {scenarioFamilies.length} live scenarios
            </div>
          </div>

          <div className="mt-7 rounded-[20px] border border-line bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock3 aria-hidden size={15} className="text-lime" />
                <p className="technical text-xs uppercase tracking-[0.24em] text-zinc-400">Timeline progress</p>
              </div>
              <p className="technical text-xs text-lime">{progress}% / ~{replaySeconds}s replay</p>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-lime shadow-lime"
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 180, damping: 24 }}
              />
            </div>
            <div className="technical mt-3 grid grid-cols-3 gap-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500 lg:grid-cols-6">
              {chainStages.map((stage, index) => (
                <span key={stage.id} className={index === activeStageIndex ? "text-lime" : ""}>
                  {stage.tactic}
                </span>
              ))}
            </div>
          </div>

          <motion.div layoutId="scenario-canvas" className="relative mt-6 min-h-[690px] lg:min-h-[540px]">
            <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" aria-hidden>
              {connectorLines.map(([x1, y1, x2, y2], index) => (
                <motion.line
                  key={`${x1}-${y1}-${x2}-${y2}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={index < activeStageIndex ? "rgba(223,255,0,0.78)" : "rgba(223,255,0,0.22)"}
                  strokeWidth={index < activeStageIndex ? "1.8" : "1.2"}
                  strokeDasharray="6 10"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              ))}
            </svg>

            <div className="grid gap-4 sm:grid-cols-2 lg:block">
              {chainStages.map((stage, index) => {
                const Icon = stage.icon;
                const isCritical = stage.severity === "critical";
                const isActive = index === activeStageIndex;
                const isComplete = index < activeStageIndex;

                return (
                  <motion.article
                    key={stage.id}
                    layoutId={`chain-node-${scenarioConfig.id}-${stage.id}`}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isActive ? 1.045 : 1,
                      borderColor: isActive ? "rgba(223,255,0,0.86)" : "rgba(255,255,255,0.1)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 26, delay: index * 0.03 }}
                    className={`glass-panel relative rounded-[22px] p-4 lg:absolute lg:w-[230px] ${
                      isActive ? "shadow-lime" : ""
                    }`}
                    style={{ left: stage.x, top: stage.y }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-[14px] border ${
                          isCritical ? "bg-crimson/10 text-crimson" : "bg-lime/10 text-lime"
                        } ${isActive ? "border-lime" : "border-line"}`}
                      >
                        <Icon aria-hidden size={18} />
                      </div>
                      <SeverityDot severity={stage.severity} active={isActive || isComplete} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-ink">{stage.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{stage.detail}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        {stage.source}
                      </span>
                      <span
                        className={`technical rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${
                          isActive
                            ? "border-lime/40 bg-lime/10 text-lime"
                            : "border-line bg-white/5 text-zinc-300"
                        }`}
                      >
                        {stage.tactic}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="technical text-xs uppercase tracking-[0.26em] text-lime">Control Panel</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Simulation</h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full border border-line bg-black/40 text-lime shadow-lime">
              <Gauge aria-hidden size={21} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-300">Scenario Type</p>
              <div className="mt-2 space-y-2">
                {selectableScenarios.map((scenario) => {
                  const isSelected = request.scenario_id === scenario.id;
                  const nextScenarioConfig = getBuilderScenario(scenario.id);

                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => {
                        setRequest({
                          ...request,
                          scenario_id: scenario.id,
                          target_user: scenario.id === "insider-data-drift" ? "morgan.ellis" : "finance.admin",
                          target_host: scenario.id === "insider-data-drift" ? "NYC-FIN-021" : "NYC-WKS-014"
                        });
                        setChatMessages([
                          {
                            id: `seed-${scenario.id}`,
                            role: "analyst",
                            text: nextScenarioConfig.seed
                          }
                        ]);
                      }}
                      className={`focus-ring w-full rounded-[16px] border p-3 text-left transition ${
                        isSelected
                          ? "border-lime/60 bg-lime/10 shadow-lime"
                          : "border-line bg-black/25 hover:border-lime/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-ink">{scenario.name}</span>
                        <span
                          className={`technical rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            isSelected ? "border-lime/40 text-lime" : "border-line text-zinc-500"
                          }`}
                        >
                          {scenario.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-zinc-500">{scenario.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-300">Target User</span>
              <input
                value={request.target_user}
                onChange={(event) => setRequest({ ...request, target_user: event.target.value })}
                className="focus-ring technical mt-2 h-12 w-full rounded-[16px] border border-line bg-black/30 px-4 text-sm text-ink placeholder:text-zinc-600"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-300">Target Host</span>
              <input
                value={request.target_host}
                onChange={(event) => setRequest({ ...request, target_host: event.target.value })}
                className="focus-ring technical mt-2 h-12 w-full rounded-[16px] border border-line bg-black/30 px-4 text-sm text-ink placeholder:text-zinc-600"
              />
            </label>

            <ControlSlider
              label="Intensity"
              value={intensityValue}
              options={intensityOptions}
              onChange={(value) => setRequest({ ...request, intensity: intensityOptions[value] })}
            />

            <ControlSlider
              label="Noise Level"
              value={noiseValue}
              options={noiseOptions}
              onChange={(value) => setRequest({ ...request, noise_level: noiseOptions[value] })}
            />

            <div className="rounded-[18px] border border-lime/25 bg-lime/[0.07] p-4 shadow-lime">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="technical text-[10px] uppercase tracking-[0.2em] text-lime">Training profile</p>
                  <h3 className="mt-2 text-base font-semibold text-ink">{variantProfile.name}</h3>
                </div>
                <span className="technical rounded-full border border-lime/30 bg-black/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-lime">
                  {request.noise_level} / {request.intensity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{variantProfile.lens}</p>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{variantProfile.learnerGoal}</p>
              <p className="technical mt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                {scenarioFamilies.length} scenarios x 9 profiles = {scenarioFamilies.length * 9} guided lab runs
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-300">Duration</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {durationOptions.map((duration) => {
                  const isActive = request.duration === duration;

                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setRequest({ ...request, duration })}
                      className={`focus-ring technical h-10 rounded-[14px] border text-[11px] transition ${
                        isActive
                          ? "border-lime bg-lime text-obsidian"
                          : "border-line bg-black/30 text-zinc-400 hover:text-ink"
                      }`}
                    >
                      {duration.replace(" minutes", "m")}
                    </button>
                  );
                })}
              </div>
              <p className="technical mt-2 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                Accelerated replay: ~{replaySeconds}s, one log every 2 seconds
              </p>
            </div>

            {showCompletionCard ? (
              <Link
                href="/"
                className="focus-ring mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110"
              >
                Launch Active Investigation -&gt;
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleRun}
                disabled={isStreaming}
                className="focus-ring mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-[18px] bg-lime px-4 text-sm font-bold text-obsidian shadow-lime transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {isStreaming ? <RefreshCw aria-hidden size={19} className="animate-spin" /> : <Play aria-hidden size={19} />}
                Run Mock Simulation
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {[
                ["Incidents", metrics.incidents],
                ["Confidence", `${metrics.confidence}%`],
                ["Telemetry", metrics.telemetry],
                ["Timeline", metrics.timeline]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[16px] border border-line bg-black/25 p-3">
                  <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[18px] border border-line bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-ink">
                  {isStreaming ? "Live Stream Running" : showCompletionCard ? "Active Investigation Ready" : result.summary.status}
                </span>
                <span className="technical rounded-full border border-crimson/30 bg-crimson/10 px-2.5 py-1 text-xs text-crimson">
                  {activeStreamCase?.severity ?? result.summary.severity}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {metrics.incidents} detections at {metrics.confidence}% confidence.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.section>

      <motion.section
        layoutId="telemetry-pulse-panel"
        className="grid gap-5 lg:grid-cols-[1fr_360px]"
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <GlassCard className="self-start overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="technical text-xs uppercase tracking-[0.26em] text-lime">Pulse Telemetry</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Synthetic Log Stream</h2>
            </div>
            <div className="technical flex items-center gap-2 rounded-full border border-line bg-white/5 px-3 py-2 text-xs text-zinc-300">
              <Activity aria-hidden size={14} className="text-lime" />
              live replay
            </div>
          </div>
          <motion.ul layout className="mt-4 max-h-[min(60vh,640px)] space-y-3 overflow-y-auto pr-1 pb-1">
            {pulseLogs.map((event, index) => (
              <PulseLog key={`${event.event_id}-${index}`} event={event} index={index} active={index === 0} />
            ))}
          </motion.ul>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="technical text-xs uppercase tracking-[0.26em] text-lime">Analyst Lens</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Strategic Insight</h2>
          <div className="mt-5 space-y-4">
            {scenarioConfig.why.map(([title, copy]) => (
              <div key={title} className="rounded-[18px] border border-line bg-black/25 p-4">
                <div className="flex items-center gap-2">
                  <ArrowRight aria-hidden size={15} className="text-lime" />
                  <p className="text-sm font-semibold text-ink">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[18px] border border-crimson/30 bg-crimson/10 p-4">
            <div className="flex items-center gap-2 text-crimson">
              <AlertTriangle aria-hidden size={16} />
              <p className="technical text-xs uppercase tracking-[0.22em]">Detection ready</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              The scenario remains fully synthetic and built for defensive education.
            </p>
          </div>

          <div className="mt-5 rounded-[18px] border border-line bg-black/30 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-[14px] border border-line bg-lime/10 text-lime">
                <BrainCircuit aria-hidden size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Live AI Analyst</p>
                <p className="technical text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {sourceLabel(aiSource)} · {aiRemainingCalls} calls left
                </p>
              </div>
              <span
                className={`technical ml-auto rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                  aiSource === "live-openai"
                    ? "border-lime/40 bg-lime/10 text-lime"
                    : aiSource === "cached"
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                      : "border-line bg-white/5 text-zinc-400"
                }`}
              >
                {aiModel}
              </span>
            </div>

            <div
              className={`mt-4 rounded-[14px] border px-3 py-2 ${
                aiStatusMode === "live-ready"
                  ? "border-lime/30 bg-lime/10"
                  : aiStatusMode === "limit-reached"
                    ? "border-crimson/30 bg-crimson/10"
                    : "border-line bg-white/5"
              }`}
            >
              <p className="technical text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {aiStatusMode === "live-ready" ? "Live AI armed" : aiStatusMode === "limit-reached" ? "AI limit reached" : "Fallback ready"}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-400">{aiStatusMessage}</p>
            </div>

            <div className="mt-4 max-h-[250px] space-y-3 overflow-hidden">
              {chatMessages.slice(0, 4).map((message) => (
                <motion.p
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`technical rounded-[14px] border border-line px-3 py-3 text-xs leading-5 ${
                    message.role === "analyst" ? "bg-lime/10 text-zinc-100" : "bg-white/5 text-zinc-300"
                  }`}
                >
                  {message.text}
                </motion.p>
              ))}
            </div>

            <form onSubmit={handleChatSubmit} className="mt-4 flex items-center gap-2 rounded-[16px] border border-line bg-black/40 p-2">
              <Bot aria-hidden size={17} className="ml-2 text-lime" />
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={
                  scenarioConfig.id === "insider-data-drift"
                    ? "ask about DLP, sharing, egress..."
                    : "ask about auth, shell, privilege, transfer..."
                }
                className="technical min-w-0 flex-1 bg-transparent px-2 text-xs text-ink outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={isAiThinking}
                className="focus-ring grid h-9 w-9 place-items-center rounded-[12px] bg-lime text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {isAiThinking ? <RefreshCw aria-hidden size={15} className="animate-spin" /> : <Send aria-hidden size={15} />}
              </button>
            </form>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {scenarioConfig.quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setChatInput(prompt)}
                  className="focus-ring technical rounded-[12px] border border-line bg-white/5 px-3 py-2 text-left text-[10px] uppercase tracking-[0.14em] text-zinc-400 transition hover:border-lime/40 hover:text-lime"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <p className="technical mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              Generated Educational Simulation only. All names, data, and IPs are FAKE.
            </p>
          </div>
        </GlassCard>
      </motion.section>
    </div>
  );
}
