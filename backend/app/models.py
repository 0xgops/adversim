from typing import Literal

from pydantic import BaseModel, Field


Intensity = Literal["Low", "Medium", "High"]
Duration = Literal["15 minutes", "30 minutes", "1 hour"]
NoiseLevel = Literal["Clean", "Realistic", "Noisy"]


class Scenario(BaseModel):
    id: str
    name: str
    status: str
    description: str
    tactics: list[str]
    telemetry_sources: list[str]


class SimulationRequest(BaseModel):
    scenario_id: str = Field(default="credential-compromise-chain")
    target_user: str = Field(default="finance.admin")
    target_host: str = Field(default="NYC-WKS-014")
    intensity: Intensity = Field(default="Medium")
    duration: Duration = Field(default="30 minutes")
    noise_level: NoiseLevel = Field(default="Realistic")


class TelemetryEvent(BaseModel):
    id: str
    timestamp: str
    source: str
    event_type: str
    user: str
    host: str
    message: str
    severity: Literal["info", "low", "medium", "high", "critical"]
    tags: list[str]


class Detection(BaseModel):
    id: str
    name: str
    severity: Literal["Low", "Medium", "High", "Critical"]
    confidence: int
    tactic: str
    matched_event_ids: list[str]
    recommendation: str


class TimelineItem(BaseModel):
    timestamp: str
    title: str
    description: str
    tactic: str
    severity: Literal["info", "low", "medium", "high", "critical"]


class SimulationSummary(BaseModel):
    status: str
    incident_count: int
    severity: Literal["Low", "Medium", "High", "Critical"]
    confidence: int
    mapped_tactics: list[str]
    target_user: str
    target_host: str


class SimulationResult(BaseModel):
    summary: SimulationSummary
    telemetry: list[TelemetryEvent]
    detections: list[Detection]
    timeline: list[TimelineItem]
    report_markdown: str


class AIAnalystRequest(BaseModel):
    prompt: str = Field(default="Explain the latest synthetic evidence.", max_length=700)
    active_phase: str = Field(default="Credential Access", max_length=80)
    session_id: str = Field(default="local-demo", max_length=96)
    telemetry: list[TelemetryEvent] = Field(default_factory=list)
    detections: list[Detection] = Field(default_factory=list)


class AIReportRequest(BaseModel):
    session_id: str = Field(default="local-demo", max_length=96)
    audience: Literal["analyst", "executive", "judge"] = Field(default="judge")


class AIResponse(BaseModel):
    text: str
    source: Literal["live-openai", "cached", "fallback"]
    model: str
    remaining_session_calls: int
    safety_note: str
    diagnostic: str | None = None


class AIStatus(BaseModel):
    mode: Literal["live-ready", "fallback-ready", "limit-reached"]
    enabled: bool
    has_api_key: bool
    model: str
    remaining_demo_calls: int
    message: str
    last_error: str | None = None
