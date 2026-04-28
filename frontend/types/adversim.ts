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
  audience: "analyst" | "executive" | "judge";
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
  remaining_demo_calls: number;
  message: string;
  last_error?: string | null;
};
