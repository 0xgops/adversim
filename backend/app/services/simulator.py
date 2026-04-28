from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.models import (
    Detection,
    Scenario,
    SimulationRequest,
    SimulationResult,
    SimulationSummary,
    TelemetryEvent,
    TimelineItem,
)


SCENARIOS: list[Scenario] = [
    Scenario(
        id="credential-compromise-chain",
        name="Credential Compromise Chain",
        status="Ready",
        description="A safe synthetic chain covering authentication anomalies, suspicious execution, privilege activity, discovery, and outbound transfer signals.",
        tactics=["Credential Access", "Initial Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"],
        telemetry_sources=["Auth logs", "Cloud login logs", "Endpoint events", "Firewall logs"],
    ),
    Scenario(
        id="insider-data-drift",
        name="Insider Data Drift",
        status="Ready",
        description="A safe synthetic data-handling scenario covering unusual file access, DLP signals, external sharing, and outbound volume drift.",
        tactics=["Discovery", "Collection", "Exfiltration", "Impact"],
        telemetry_sources=["File access logs", "DLP events", "Proxy logs"],
    ),
    Scenario(
        id="ransomware-pattern",
        name="Ransomware Pattern",
        status="Template only",
        description="Non-operational placeholder for defensive pattern recognition training.",
        tactics=["Execution", "Impact", "Recovery"],
        telemetry_sources=["Endpoint events", "File events", "Backup alerts"],
    ),
    Scenario(
        id="cloud-account-takeover",
        name="Cloud Account Takeover",
        status="Coming soon",
        description="Template placeholder for cloud identity anomaly training.",
        tactics=["Initial Access", "Persistence", "Discovery"],
        telemetry_sources=["Cloud audit logs", "IAM events", "API activity"],
    ),
]


def list_scenarios() -> list[Scenario]:
    return SCENARIOS


def generate_simulation(request: SimulationRequest) -> SimulationResult:
    base_time = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    intensity_offset = {"Low": 0, "Medium": 1, "High": 2}[request.intensity]
    scenario_name = _scenario_name(request.scenario_id)

    if request.scenario_id == "insider-data-drift":
        confidence = {"Low": 78, "Medium": 88, "High": 94}[request.intensity]
        telemetry = _build_insider_telemetry(request, base_time, intensity_offset)
        detections = _build_insider_detections()
        timeline = _build_insider_timeline(request, base_time)
        mapped_tactics = ["Discovery", "Collection", "Exfiltration", "Impact"]
        severity = "Critical" if request.intensity == "High" else "High"
    else:
        confidence = {"Low": 82, "Medium": 92, "High": 96}[request.intensity]
        telemetry = _build_credential_telemetry(request, base_time, intensity_offset)
        detections = _build_credential_detections()
        timeline = _build_credential_timeline(request, base_time)
        mapped_tactics = ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"]
        severity = "Critical"

    summary = SimulationSummary(
        status="Attack Simulation Complete",
        incident_count=len(detections),
        severity=severity,
        confidence=confidence,
        mapped_tactics=mapped_tactics,
        target_user=request.target_user,
        target_host=request.target_host,
    )

    return SimulationResult(
        summary=summary,
        telemetry=telemetry,
        detections=detections,
        timeline=timeline,
        report_markdown=_build_report(request, scenario_name, summary, detections, timeline),
    )


def _time(base_time: datetime, minutes: int) -> str:
    return (base_time + timedelta(minutes=minutes)).isoformat()


def _scenario_name(scenario_id: str) -> str:
    return next((scenario.name for scenario in SCENARIOS if scenario.id == scenario_id), "Credential Compromise Chain")


def _variant_profile(request: SimulationRequest) -> tuple[str, str]:
    profiles = {
        ("Clean", "Low"): ("Guided First Case", "Minimal noise and low pressure for learning the basic incident shape."),
        ("Clean", "Medium"): ("Focused Investigation", "Clear signal with moderate stakes for practicing timeline reconstruction."),
        ("Clean", "High"): ("High-Signal Escalation", "Clear signal with urgent impact for learning when to escalate fast."),
        ("Realistic", "Low"): ("Everyday SOC Triage", "Normal business context with low pressure for separating routine activity from suspicious clues."),
        ("Realistic", "Medium"): ("SOC Training Default", "Balanced signal, context, and urgency for a realistic analyst workflow."),
        ("Realistic", "High"): ("Priority Incident", "Realistic context with high urgency for confidence-building across systems."),
        ("Noisy", "Low"): ("Needle Finder", "Background activity with low stakes for learning not to overreact."),
        ("Noisy", "Medium"): ("Signal vs. Noise", "Messy data with moderate urgency for preserving the true incident story."),
        ("Noisy", "High"): ("Triage Under Pressure", "Messy data with urgent impact for practicing prioritization under pressure."),
    }
    return profiles[(request.noise_level, request.intensity)]


def _build_credential_telemetry(request: SimulationRequest, base_time: datetime, intensity_offset: int) -> list[TelemetryEvent]:
    user = request.target_user
    host = request.target_host
    unusual_ip = "198.51.100.44"
    transfer_mb = 420 + (intensity_offset * 180)

    telemetry = [
        TelemetryEvent(
            id="evt-1001",
            timestamp=_time(base_time, 0),
            source="auth",
            event_type="failed_login",
            user=user,
            host=host,
            message=f"Failed login attempt for {user} from unfamiliar source.",
            severity="medium",
            tags=["synthetic", "credential-access"],
        ),
        TelemetryEvent(
            id="evt-1002",
            timestamp=_time(base_time, 1),
            source="auth",
            event_type="failed_login",
            user=user,
            host=host,
            message=f"Second failed login attempt for {user} within short window.",
            severity="medium",
            tags=["synthetic", "credential-access"],
        ),
        TelemetryEvent(
            id="evt-1003",
            timestamp=_time(base_time, 3),
            source="cloud-login",
            event_type="successful_login",
            user=user,
            host=host,
            message=f"Successful login for {user} from unusual IP {unusual_ip}.",
            severity="high",
            tags=["synthetic", "initial-access", "impossible-travel-check"],
        ),
        TelemetryEvent(
            id="evt-1004",
            timestamp=_time(base_time, 5),
            source="endpoint",
            event_type="process_activity",
            user=user,
            host=host,
            message="Suspicious administrative shell pattern observed in synthetic endpoint event.",
            severity="high",
            tags=["synthetic", "execution"],
        ),
        TelemetryEvent(
            id="evt-1005",
            timestamp=_time(base_time, 7),
            source="identity",
            event_type="privilege_change_attempt",
            user=user,
            host=host,
            message="Attempted admin group membership change recorded in lab telemetry.",
            severity="critical",
            tags=["synthetic", "privilege-escalation"],
        ),
        TelemetryEvent(
            id="evt-1006",
            timestamp=_time(base_time, 9),
            source="endpoint",
            event_type="file_discovery",
            user=user,
            host=host,
            message="Sensitive directory enumeration pattern detected in synthetic file events.",
            severity="high",
            tags=["synthetic", "discovery", "collection"],
        ),
        TelemetryEvent(
            id="evt-1007",
            timestamp=_time(base_time, 12),
            source="network",
            event_type="large_outbound_transfer",
            user=user,
            host=host,
            message=f"Large outbound transfer flagged by firewall analytics: {transfer_mb} MB.",
            severity="critical",
            tags=["synthetic", "exfiltration"],
        ),
    ]

    if request.noise_level in {"Realistic", "Noisy"}:
        telemetry.append(
            TelemetryEvent(
                id="evt-1010",
                timestamp=_time(base_time, 10),
                source="context",
                event_type="normal_business_activity",
                user=user,
                host=host,
                message="Normal business activity overlaps the alert window; included to teach signal-versus-context triage.",
                severity="info",
                tags=["synthetic", "context"],
            )
        )

    if request.noise_level == "Noisy":
        telemetry.extend(
            [
                TelemetryEvent(
                    id="evt-1011",
                    timestamp=_time(base_time, 6),
                    source="noise",
                    event_type="benign_inventory",
                    user=user,
                    host=host,
                    message="Benign software inventory heartbeat appears near the endpoint signal.",
                    severity="info",
                    tags=["synthetic", "noise"],
                ),
                TelemetryEvent(
                    id="evt-1012",
                    timestamp=_time(base_time, 11),
                    source="noise",
                    event_type="benign_patch_signal",
                    user=user,
                    host=host,
                    message="Patch-management heartbeat overlaps the case window but does not change the incident sequence.",
                    severity="info",
                    tags=["synthetic", "noise"],
                ),
            ]
        )

    return telemetry


def _build_insider_telemetry(request: SimulationRequest, base_time: datetime, intensity_offset: int) -> list[TelemetryEvent]:
    user = request.target_user
    host = request.target_host
    file_count = 90 + (intensity_offset * 44)
    transfer_mb = 180 + (intensity_offset * 140)

    telemetry = [
        TelemetryEvent(
            id="evt-3001",
            timestamp=_time(base_time, 0),
            source="fileshare",
            event_type="after_hours_access",
            user=user,
            host=host,
            message=f"After-hours access by {user} to \\\\fileshare\\HR\\Compensation from {host}; baseline usually shows business-hours reads.",
            severity="medium",
            tags=["synthetic", "insider", "discovery"],
        ),
        TelemetryEvent(
            id="evt-3002",
            timestamp=_time(base_time, 2),
            source="fileshare",
            event_type="access_burst",
            user=user,
            host=host,
            message=f"File access burst: {file_count} metadata reads across Finance and HR folders in 4 minutes.",
            severity="high",
            tags=["synthetic", "insider", "collection"],
        ),
        TelemetryEvent(
            id="evt-3003",
            timestamp=_time(base_time, 4),
            source="dlp",
            event_type="sensitive_label_match",
            user=user,
            host=host,
            message="DLP classifier matched synthetic payroll, compensation, and quarterly-planning labels in the access pattern.",
            severity="high",
            tags=["synthetic", "dlp", "collection"],
        ),
        TelemetryEvent(
            id="evt-3004",
            timestamp=_time(base_time, 6),
            source="endpoint",
            event_type="archive_staging",
            user=user,
            host=host,
            message=f"Temporary archive staging observed on {host}; filenames resemble synthetic HR and finance exports.",
            severity="high",
            tags=["synthetic", "collection", "staging"],
        ),
        TelemetryEvent(
            id="evt-3005",
            timestamp=_time(base_time, 8),
            source="saas-audit",
            event_type="external_share",
            user=user,
            host=host,
            message="External share event created for finance-review-bundle.zip to review-drop.adversim.test; lab-only destination.",
            severity="critical",
            tags=["synthetic", "exfiltration", "sharing"],
        ),
        TelemetryEvent(
            id="evt-3006",
            timestamp=_time(base_time, 10),
            source="proxy",
            event_type="egress_volume_drift",
            user=user,
            host=host,
            message=f"Proxy summary: {transfer_mb} MB outbound upload from {host}; exceeds the user's normal working-set baseline.",
            severity="critical",
            tags=["synthetic", "exfiltration", "network"],
        ),
        TelemetryEvent(
            id="evt-3007",
            timestamp=_time(base_time, 12),
            source="case",
            event_type="insider_rollup",
            user=user,
            host=host,
            message="Case rollup: unusual access, sensitive labels, archive staging, external share, and egress drift merged into one insider-risk incident.",
            severity="critical",
            tags=["synthetic", "insider", "impact"],
        ),
    ]

    if request.noise_level in {"Realistic", "Noisy"}:
        telemetry.append(
            TelemetryEvent(
                id="evt-3010",
                timestamp=_time(base_time, 7),
                source="context",
                event_type="business_background",
                user=user,
                host=host,
                message="Routine collaboration overlaps the case window; included to teach balanced insider-risk triage.",
                severity="info",
                tags=["synthetic", "context"],
            )
        )

    if request.noise_level == "Noisy":
        telemetry.extend(
            [
                TelemetryEvent(
                    id="evt-3011",
                    timestamp=_time(base_time, 3),
                    source="noise",
                    event_type="benign_collaboration",
                    user=user,
                    host=host,
                    message="Background collaboration activity appears near the file access burst.",
                    severity="info",
                    tags=["synthetic", "noise"],
                ),
                TelemetryEvent(
                    id="evt-3012",
                    timestamp=_time(base_time, 9),
                    source="noise",
                    event_type="benign_admin_task",
                    user=user,
                    host=host,
                    message="Background admin task overlaps the sharing window but is not part of the insider-risk sequence.",
                    severity="info",
                    tags=["synthetic", "noise"],
                ),
            ]
        )

    return telemetry


def _build_credential_detections() -> list[Detection]:
    return [
        Detection(
            id="det-2001",
            name="Repeated Authentication Failures Followed by Success",
            severity="High",
            confidence=90,
            tactic="Credential Access",
            matched_event_ids=["evt-1001", "evt-1002", "evt-1003"],
            recommendation="Review sign-in context, reset the account password if authorized, and validate MFA state.",
        ),
        Detection(
            id="det-2002",
            name="Suspicious Administrative Shell Activity",
            severity="High",
            confidence=86,
            tactic="Execution",
            matched_event_ids=["evt-1004"],
            recommendation="Inspect the endpoint process tree and confirm whether the activity matches expected admin work.",
        ),
        Detection(
            id="det-2003",
            name="Privileged Group Modification Attempt",
            severity="Critical",
            confidence=94,
            tactic="Privilege Escalation",
            matched_event_ids=["evt-1005"],
            recommendation="Audit group membership changes, revoke unauthorized access, and preserve identity logs.",
        ),
        Detection(
            id="det-2004",
            name="Discovery Followed by Large Outbound Transfer",
            severity="Critical",
            confidence=92,
            tactic="Exfiltration",
            matched_event_ids=["evt-1006", "evt-1007"],
            recommendation="Contain affected host, review outbound destination, and start data exposure assessment.",
        ),
    ]


def _build_insider_detections() -> list[Detection]:
    return [
        Detection(
            id="det-3001",
            name="After-Hours Sensitive File Access",
            severity="Medium",
            confidence=82,
            tactic="Discovery",
            matched_event_ids=["evt-3001", "evt-3002"],
            recommendation="Validate whether the access aligns with approved business activity and compare against the user's normal file-access baseline.",
        ),
        Detection(
            id="det-3002",
            name="Sensitive Label Collection Pattern",
            severity="High",
            confidence=88,
            tactic="Collection",
            matched_event_ids=["evt-3002", "evt-3003", "evt-3004"],
            recommendation="Review DLP context, file categories, and whether the staging behavior has a legitimate business explanation.",
        ),
        Detection(
            id="det-3003",
            name="External Share With Egress Drift",
            severity="Critical",
            confidence=93,
            tactic="Exfiltration",
            matched_event_ids=["evt-3005", "evt-3006"],
            recommendation="Suspend or review the external share, preserve audit logs, and confirm whether outbound volume is authorized.",
        ),
        Detection(
            id="det-3004",
            name="Insider-Risk Sequence Correlation",
            severity="High",
            confidence=90,
            tactic="Impact",
            matched_event_ids=["evt-3001", "evt-3003", "evt-3005", "evt-3007"],
            recommendation="Escalate for human review, document the sequence, and coordinate with management or legal according to policy.",
        ),
    ]


def _build_credential_timeline(request: SimulationRequest, base_time: datetime) -> list[TimelineItem]:
    user = request.target_user
    host = request.target_host

    return [
        TimelineItem(
            timestamp=_time(base_time, 0),
            title="Failed login pattern begins",
            description=f"{user} shows repeated failed authentication attempts against {host}.",
            tactic="Credential Access",
            severity="medium",
        ),
        TimelineItem(
            timestamp=_time(base_time, 3),
            title="Unusual successful login",
            description="The account successfully authenticates from a source not normally associated with this user.",
            tactic="Initial Access",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 5),
            title="Suspicious shell-like admin activity",
            description="Endpoint telemetry records an administrative command pattern for defensive training analysis.",
            tactic="Execution",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 7),
            title="Privilege change attempt",
            description="Identity telemetry flags an attempted admin group membership change.",
            tactic="Privilege Escalation",
            severity="critical",
        ),
        TimelineItem(
            timestamp=_time(base_time, 9),
            title="File discovery activity",
            description="Synthetic endpoint telemetry indicates sensitive directory discovery behavior.",
            tactic="Discovery",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 12),
            title="Large outbound transfer",
            description="Network telemetry flags an unusual outbound transfer volume from the target host.",
            tactic="Exfiltration",
            severity="critical",
        ),
    ]


def _build_insider_timeline(request: SimulationRequest, base_time: datetime) -> list[TimelineItem]:
    user = request.target_user
    host = request.target_host

    return [
        TimelineItem(
            timestamp=_time(base_time, 0),
            title="After-hours file access begins",
            description=f"{user} accesses sensitive HR and finance locations from {host} outside the normal baseline.",
            tactic="Discovery",
            severity="medium",
        ),
        TimelineItem(
            timestamp=_time(base_time, 2),
            title="File access burst expands",
            description="The access pattern broadens into multiple folders, creating a visible collection signal.",
            tactic="Collection",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 4),
            title="DLP labels match sensitive categories",
            description="Synthetic DLP telemetry identifies compensation and planning labels in the accessed material.",
            tactic="Collection",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 6),
            title="Archive staging pattern appears",
            description="Endpoint telemetry shows a temporary staging pattern consistent with preparing bundled data.",
            tactic="Collection",
            severity="high",
        ),
        TimelineItem(
            timestamp=_time(base_time, 8),
            title="External sharing event created",
            description="SaaS audit telemetry records a lab-only external share event for the staged bundle.",
            tactic="Exfiltration",
            severity="critical",
        ),
        TimelineItem(
            timestamp=_time(base_time, 10),
            title="Outbound volume drifts above baseline",
            description="Proxy telemetry shows upload volume exceeding the user's normal working-set baseline.",
            tactic="Exfiltration",
            severity="critical",
        ),
    ]


def _build_report(
    request: SimulationRequest,
    scenario_name: str,
    summary: SimulationSummary,
    detections: list[Detection],
    timeline: list[TimelineItem],
) -> str:
    profile_name, profile_description = _variant_profile(request)
    detection_lines = "\n".join(
        f"- **{detection.name}** ({detection.severity}, {detection.confidence}% confidence): {detection.recommendation}"
        for detection in detections
    )
    timeline_lines = "\n".join(
        f"- {item.timestamp}: **{item.title}** - {item.description}"
        for item in timeline
    )

    return f"""# AdverSim Incident Report

## Executive Summary

AdverSim generated a safe synthetic **{scenario_name}** training scenario for `{request.target_user}` on `{request.target_host}` using the **{profile_name}** profile. The detection engine identified {summary.incident_count} suspicious activity clusters with overall {summary.severity} severity and {summary.confidence}% confidence.

## Scope

- Scenario: {scenario_name}
- Target user: {request.target_user}
- Target host: {request.target_host}
- Intensity: {request.intensity}
- Duration: {request.duration}
- Noise level: {request.noise_level}
- Training profile: {profile_name} - {profile_description}

## Detection Findings

{detection_lines}

## Reconstructed Timeline

{timeline_lines}

## Recommended Response

- Validate the user's recent authentication activity.
- Review endpoint process and identity logs for the affected host.
- Contain the endpoint if suspicious activity is confirmed.
- Preserve relevant telemetry for incident handling.
- Tune detection rules using the synthetic scenario as a repeatable test case.

## Safety Note

This report is generated only from synthetic defensive telemetry. It contains no real exploitation instructions, malware behavior, credential theft steps, evasion guidance, or live targeting.
"""
