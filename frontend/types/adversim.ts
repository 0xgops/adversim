export type Scenario = {
  id: string;
  name: string;
  status: string;
  description: string;
  tactics: string[];
  telemetry_sources: string[];
};

export type SimulationRequest = {
  scenario_id: string;
  target_user: string;
  target_host: string;
  intensity: "Low" | "Medium" | "High";
  duration: "15 minutes" | "30 minutes" | "1 hour";
  noise_level: "Clean" | "Realistic" | "Noisy";
};

export type TelemetryEvent = {
  id: string;
  timestamp: string;
  source: string;
  event_type: string;
  user: string;
  host: string;
  message: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  tags: string[];
};

export type Detection = {
  id: string;
  name: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  tactic: string;
  matched_event_ids: string[];
  recommendation: string;
};

export type TimelineItem = {
  timestamp: string;
  title: string;
  description: string;
  tactic: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
};

export type SimulationSummary = {
  status: string;
  incident_count: number;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  mapped_tactics: string[];
  target_user: string;
  target_host: string;
};

export type SimulationResult = {
  summary: SimulationSummary;
  telemetry: TelemetryEvent[];
  detections: Detection[];
  timeline: TimelineItem[];
  report_markdown: string;
};

export type AIAnalystRequest = {
  prompt: string;
  active_phase: string;
  session_id: string;
  telemetry: TelemetryEvent[];
  detections: Detection[];
};

export type AIReportRequest = {
  session_id: string;
  audience: "analyst" | "executive" | "stakeholder";
};

export type AIResponse = {
  text: string;
  source: "live-openai" | "cached" | "fallback";
  model: string;
  remaining_session_calls: number;
  safety_note: string;
  diagnostic?: string | null;
};

export type AIStatus = {
  mode: "live-ready" | "fallback-ready" | "limit-reached";
  enabled: boolean;
  has_api_key: boolean;
  model: string;
  remaining_session_calls: number;
  message: string;
  last_error?: string | null;
};
export type ScenarioFamily =
  | "Credential Compromise"
  | "Insider Data Drift"
  | "Cloud Account Takeover"
  | "Endpoint Activity"
  | "Exfiltration Signal"
  | "Lateral Movement"
  | "Ransomware Precursor"
  | "Supply Chain Compromise"
  | "Spear-Phishing Campaign"
  | "Web API Exploitation"
  | "Shadow Persistence"
  | "API Breach: Exfil Pulse"
  | "Ransomware Stage: Alpha"
  | "Insider Leak: Departure"
  | "Zero-Day: Log-Pulse RCE"
  | "Supply Chain: Poisoned Update"
  | "Identity: Session Hijack"
  | "Stealth: Resource Exhaustion"
  | "Recon: Password Spraying"
  | "BEC: Financial Diversion"
  | "SQLi: Customer Data Harvest"
  | "Shadow IT: Rogue Access Point"
  | "IoT: HVAC Gateway Breach"
  | "Cloud: S3 Bucket Leak"
  | "Persistence: WMI Event Hook"
  | "Physical: BadUSB Parking Lot Drop"
  | "Social: AI-Driven Vishing"
  | "Shadow IT: Hardware Implant";

export type ScenarioDifficulty = "Beginner" | "Intermediate" | "Expert";
export type ScenarioRandomness = "Low" | "Medium" | "Chaos Lab";
export type TrainingMode = "Guided" | "Blind Investigation";

export type CaseChartData = {
  mappedTactics: number[];
  severityHeat: number[];
};

export type EvidenceEvent = {
  event_id: string;
  timestamp: string;
  source: string;
  summary: string;
  plain_english: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  user: string;
  host: string;
  is_key_evidence: boolean;
  tags: string[];
  source_ref?: string;
};

export type ScenarioCase = {
  case_id: string;
  title: string;
  scenario_family: ScenarioFamily;
  difficulty: ScenarioDifficulty;
  severity: "Low" | "Medium" | "High" | "Critical";
  target_user: string;
  target_host: string;
  attacker_profile: string;
  false_lead: string;
  confidence: number;
  case_briefing: string;
  operational_guidance: string;
  telemetry_events: EvidenceEvent[];
  key_evidence_event_ids: string[];
  decoy_event_ids: string[];
  expected_findings: string[];
  recommended_response: string[];
  prevention_lessons: string[];
  chartData: CaseChartData;
};

export type CaseDebrief = {
  correctly_identified: EvidenceEvent[];
  missed_clues: EvidenceEvent[];
  false_positives: EvidenceEvent[];
  severity_explanation: string;
  prevention_guidance: string[];
  analyst_score: number;
  outcome_label: string;
};

