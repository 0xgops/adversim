from __future__ import annotations

import hashlib
import json
import os
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date
from typing import Literal

from app.models import AIAnalystRequest, AIReportRequest, AIResponse, AIStatus, SimulationResult


AI_SOURCE = Literal["live-openai", "cached", "fallback"]
SAFETY_NOTE = "Synthetic defensive training only. No live targeting, exploitation, credential theft, malware, or evasion."


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except ValueError:
        return default


@dataclass
class AIBudget:
    session_limit: int = field(default_factory=lambda: _env_int("ADVERSIM_AI_MAX_SESSION_CALLS", 5))
    daily_limit: int = field(default_factory=lambda: _env_int("ADVERSIM_AI_MAX_DAILY_CALLS", 100))
    calls_by_session: dict[str, int] = field(default_factory=lambda: defaultdict(int))
    calls_today: int = 0
    budget_day: date = field(default_factory=date.today)

    def _roll_day(self) -> None:
        today = date.today()
        if today != self.budget_day:
            self.budget_day = today
            self.calls_today = 0
            self.calls_by_session.clear()

    def remaining_for_session(self, session_id: str) -> int:
        self._roll_day()
        session_remaining = self.session_limit - self.calls_by_session[session_id]
        daily_remaining = self.daily_limit - self.calls_today
        return max(0, min(session_remaining, daily_remaining))

    def can_spend(self, session_id: str) -> bool:
        return self.remaining_for_session(session_id) > 0

    def spend(self, session_id: str) -> None:
        self._roll_day()
        self.calls_by_session[session_id] += 1
        self.calls_today += 1


class AIAnalystService:
    def __init__(self) -> None:
        self.model = os.getenv("ADVERSIM_AI_MODEL", "gpt-5-mini")
        self.max_output_tokens = _env_int("ADVERSIM_AI_MAX_OUTPUT_TOKENS", 700)
        self.timeout_seconds = _env_int("ADVERSIM_AI_TIMEOUT_SECONDS", 20)
        self.budget = AIBudget()
        self.cache: dict[str, str] = {}

    def explain(self, request: AIAnalystRequest, latest_result: SimulationResult) -> AIResponse:
        context = _compact_context(latest_result, request)
        user_prompt = f"""User question:
{request.prompt}

Active phase:
{request.active_phase}

Synthetic lab context:
{context}
"""
        fallback = _fallback_analyst_response(request, latest_result)
        return self._complete("analyst", request.session_id, user_prompt, fallback)

    def report(self, request: AIReportRequest, latest_result: SimulationResult) -> AIResponse:
        context = _compact_context(latest_result, None)
        user_prompt = f"""Generate a polished AdverSim incident report for a {request.audience} audience.

Use Markdown. Keep it concise, demo-ready, and safe.

Synthetic lab context:
{context}
"""
        fallback = _fallback_report(latest_result, request.audience)
        return self._complete("report", request.session_id, user_prompt, fallback, max_output_tokens=900)

    def status(self, session_id: str = "local-demo") -> AIStatus:
        api_key = os.getenv("OPENAI_API_KEY")
        ai_enabled = os.getenv("ADVERSIM_AI_ENABLED", "true").lower() not in {"0", "false", "off", "no"}
        remaining = self.budget.remaining_for_session(session_id)

        if not ai_enabled or not api_key:
            return AIStatus(
                mode="fallback-ready",
                enabled=ai_enabled,
                has_api_key=bool(api_key),
                model=self.model,
                remaining_demo_calls=remaining,
                message="Guarded fallback is ready. Set OPENAI_API_KEY in the backend shell to enable live AI.",
            )

        if remaining <= 0:
            return AIStatus(
                mode="limit-reached",
                enabled=ai_enabled,
                has_api_key=True,
                model=self.model,
                remaining_demo_calls=0,
                message="Live AI is configured, but the demo call limit has been reached. Cached/fallback responses remain available.",
            )

        return AIStatus(
            mode="live-ready",
            enabled=True,
            has_api_key=True,
            model=self.model,
            remaining_demo_calls=remaining,
            message="Live OpenAI analyst is armed. First answer will use API credits unless a cached answer exists.",
        )

    def _complete(
        self,
        intent: str,
        session_id: str,
        user_prompt: str,
        fallback: str,
        max_output_tokens: int | None = None,
    ) -> AIResponse:
        cache_key = _hash_key(intent, self.model, user_prompt)
        remaining = self.budget.remaining_for_session(session_id)

        if cache_key in self.cache:
            return _response(self.cache[cache_key], "cached", self.model, remaining)

        api_key = os.getenv("OPENAI_API_KEY")
        ai_enabled = os.getenv("ADVERSIM_AI_ENABLED", "true").lower() not in {"0", "false", "off", "no"}

        if not api_key or not ai_enabled or not self.budget.can_spend(session_id):
            return _response(fallback, "fallback", self.model, remaining)

        try:
            text = self._call_openai(user_prompt, max_output_tokens or self.max_output_tokens)
        except Exception as error:
            print(f"AdverSim AI fallback after OpenAI error: {error!r}")
            return _response(fallback, "fallback", self.model, remaining)

        self.budget.spend(session_id)
        remaining_after_spend = self.budget.remaining_for_session(session_id)
        self.cache[cache_key] = text
        return _response(text, "live-openai", self.model, remaining_after_spend)

    def _call_openai(self, user_prompt: str, max_output_tokens: int) -> str:
        from openai import OpenAI

        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], timeout=self.timeout_seconds)
        response = client.responses.create(
            model=self.model,
            instructions=SYSTEM_PROMPT,
            input=user_prompt,
            reasoning={"effort": "minimal"},
            text={"verbosity": "low"},
            max_output_tokens=max(1200, max_output_tokens),
        )
        text = getattr(response, "output_text", "") or ""
        if not text.strip():
            raise RuntimeError("OpenAI response did not include output text.")
        return text.strip()


SYSTEM_PROMPT = f"""You are AdverSim's Live AI Analyst, an expert blue-team mentor.

Rules:
- Treat every artifact as synthetic defensive training data.
- Explain detection reasoning, evidence, triage priority, and response next steps.
- Be specific enough to teach SOC analysts and clear enough for non-cyber judges.
- Do not provide exploitation steps, malware instructions, credential theft guidance, evasion instructions, or live targeting guidance.
- If command-like strings appear, describe them only as inert telemetry indicators.
- Keep answers compact and presentation-ready.

Safety boundary: {SAFETY_NOTE}
"""


def _hash_key(intent: str, model: str, prompt: str) -> str:
    digest = hashlib.sha256(prompt.encode("utf-8")).hexdigest()
    return f"{intent}:{model}:{digest}"


def _response(text: str, source: AI_SOURCE, model: str, remaining: int) -> AIResponse:
    return AIResponse(
        text=text,
        source=source,
        model=model,
        remaining_session_calls=remaining,
        safety_note=SAFETY_NOTE,
    )


def _compact_context(latest_result: SimulationResult, request: AIAnalystRequest | None) -> str:
    telemetry = request.telemetry if request and request.telemetry else latest_result.telemetry
    detections = request.detections if request and request.detections else latest_result.detections
    payload = {
        "summary": latest_result.summary.model_dump(),
        "telemetry": [event.model_dump() for event in telemetry[-10:]],
        "detections": [detection.model_dump() for detection in detections],
        "timeline": [item.model_dump() for item in latest_result.timeline],
    }
    return json.dumps(payload, indent=2)


def _fallback_analyst_response(request: AIAnalystRequest, latest_result: SimulationResult) -> str:
    prompt = request.prompt.lower()
    summary = latest_result.summary

    if any(term in prompt for term in ["auth", "login", "4624", "4625", "credential"]):
        return (
            "[AI Analyst - guarded fallback]: The authentication evidence shows repeated failures followed by a "
            "successful unusual sign-in. In a blue-team workflow, that sequence raises confidence because the success "
            "arrives after pressure against the account, not as an isolated event."
        )

    if any(term in prompt for term in ["shell", "process", "endpoint", "4104", "execution"]):
        return (
            "[AI Analyst - guarded fallback]: The endpoint evidence represents suspicious administrative shell telemetry. "
            "The teaching point is parent-child process context, frequency against baseline, and whether the activity "
            "matches expected admin maintenance."
        )

    if any(term in prompt for term in ["priv", "admin", "4732", "group"]):
        return (
            "[AI Analyst - guarded fallback]: The privilege evidence shows a blocked group-modification attempt after "
            "identity and endpoint anomalies. That timing matters because chained signals are stronger than a single alert."
        )

    if any(term in prompt for term in ["exfil", "transfer", "egress", "network", "dns"]):
        return (
            "[AI Analyst - guarded fallback]: The network evidence shows outbound volume rising after discovery behavior. "
            "For defenders, the key is sequence correlation: discovery plus egress creates a stronger incident narrative."
        )

    if any(term in prompt for term in ["dlp", "insider", "share", "file", "upload"]):
        return (
            "[AI Analyst - guarded fallback]: The insider-risk evidence should be read as a sequence: unusual file access, "
            "sensitive labels, staging behavior, external sharing, and upload drift. The teaching point is to validate "
            "business context and policy before assuming intent."
        )

    return (
        f"[AI Analyst - guarded fallback]: AdverSim currently shows {summary.incident_count} detection clusters at "
        f"{summary.confidence}% confidence for {summary.target_user} on {summary.target_host}. Ask about auth, endpoint, "
        "privilege, discovery, or transfer evidence to get a focused blue-team explanation."
    )


def _fallback_report(latest_result: SimulationResult, audience: str) -> str:
    summary = latest_result.summary
    detection_lines = "\n".join(
        f"- **{detection.name}**: {detection.severity}, {detection.confidence}% confidence. {detection.recommendation}"
        for detection in latest_result.detections
    )
    timeline_lines = "\n".join(
        f"- **{item.title}** ({item.tactic}): {item.description}"
        for item in latest_result.timeline
    )
    audience_note = "judges" if audience == "judge" else audience

    return f"""# AdverSim AI Incident Brief

## Executive Summary

AdverSim generated a synthetic Credential Compromise Chain for `{summary.target_user}` on `{summary.target_host}`. The lab detected {summary.incident_count} suspicious clusters with {summary.severity} severity and {summary.confidence}% confidence.

## Why This Matters For {audience_note.title()}

The demo shows how defenders can move from raw telemetry to detection evidence, timeline reconstruction, and report-ready communication without touching live systems.

## Detection Evidence

{detection_lines}

## Reconstructed Timeline

{timeline_lines}

## Recommended Defensive Actions

- Validate recent authentication activity for the affected identity.
- Review endpoint process lineage and identity-change telemetry.
- Preserve relevant logs for incident handling.
- Tune detections against this repeatable synthetic scenario.

## Safety Boundary

{SAFETY_NOTE}
"""
