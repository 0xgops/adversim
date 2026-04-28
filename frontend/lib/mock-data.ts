import type { Scenario, SimulationResult } from "@/types/adversim";

export const scenarios: Scenario[] = [
  {
    id: "credential-compromise-chain",
    name: "Credential Compromise Chain",
    status: "Ready",
    description: "Authentication anomalies, suspicious execution, privilege activity, discovery, and outbound transfer signals.",
    tactics: ["Credential Access", "Initial Access", "Execution", "Privilege Escalation", "Discovery"],
    telemetry_sources: ["Auth logs", "Cloud login logs", "Endpoint events", "Firewall logs"]
  },
  {
    id: "insider-data-drift",
    name: "Insider Data Drift",
    status: "Ready",
    description: "Unusual file access, DLP labels, external sharing, and outbound volume drift.",
    tactics: ["Discovery", "Collection", "Exfiltration", "Impact"],
    telemetry_sources: ["File access logs", "DLP events"]
  },
  {
    id: "ransomware-pattern",
    name: "Ransomware Pattern",
    status: "Template only",
    description: "Non-operational placeholder for defensive pattern recognition training.",
    tactics: ["Execution", "Impact"],
    telemetry_sources: ["Endpoint events", "File events"]
  },
  {
    id: "cloud-account-takeover",
    name: "Cloud Account Takeover",
    status: "Coming soon",
    description: "Template for cloud identity anomaly training.",
    tactics: ["Initial Access", "Persistence", "Discovery"],
    telemetry_sources: ["Cloud audit logs", "IAM events"]
  }
];

export const simulation: SimulationResult = {
  summary: {
    status: "Attack Simulation Complete",
    incident_count: 4,
    severity: "Critical",
    confidence: 92,
    mapped_tactics: ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"],
    target_user: "finance.admin",
    target_host: "NYC-WKS-014"
  },
  telemetry: [
    {
      id: "evt-1001",
      timestamp: "2026-04-27T22:04:00Z",
      source: "auth",
      event_type: "failed_login",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Failed login attempt for finance.admin from unfamiliar source.",
      severity: "medium",
      tags: ["synthetic", "credential-access"]
    },
    {
      id: "evt-1002",
      timestamp: "2026-04-27T22:05:00Z",
      source: "auth",
      event_type: "failed_login",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Second failed login attempt for finance.admin within short window.",
      severity: "medium",
      tags: ["synthetic", "credential-access"]
    },
    {
      id: "evt-1003",
      timestamp: "2026-04-27T22:07:00Z",
      source: "cloud-login",
      event_type: "successful_login",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Successful login for finance.admin from unusual IP 198.51.100.44.",
      severity: "high",
      tags: ["synthetic", "initial-access"]
    },
    {
      id: "evt-1004",
      timestamp: "2026-04-27T22:09:00Z",
      source: "endpoint",
      event_type: "process_activity",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Suspicious administrative shell pattern observed in synthetic endpoint event.",
      severity: "high",
      tags: ["synthetic", "execution"]
    },
    {
      id: "evt-1005",
      timestamp: "2026-04-27T22:11:00Z",
      source: "identity",
      event_type: "privilege_change_attempt",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Attempted admin group membership change recorded in lab telemetry.",
      severity: "critical",
      tags: ["synthetic", "privilege-escalation"]
    },
    {
      id: "evt-1006",
      timestamp: "2026-04-27T22:13:00Z",
      source: "endpoint",
      event_type: "file_discovery",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Sensitive directory enumeration pattern detected in synthetic file events.",
      severity: "high",
      tags: ["synthetic", "discovery"]
    },
    {
      id: "evt-1007",
      timestamp: "2026-04-27T22:16:00Z",
      source: "network",
      event_type: "large_outbound_transfer",
      user: "finance.admin",
      host: "NYC-WKS-014",
      message: "Large outbound transfer flagged by firewall analytics: 600 MB.",
      severity: "critical",
      tags: ["synthetic", "exfiltration"]
    }
  ],
  detections: [
    {
      id: "det-2001",
      name: "Repeated Authentication Failures Followed by Success",
      severity: "High",
      confidence: 90,
      tactic: "Credential Access",
      matched_event_ids: ["evt-1001", "evt-1002", "evt-1003"],
      recommendation: "Review sign-in context, reset the account password if authorized, and validate MFA state."
    },
    {
      id: "det-2002",
      name: "Suspicious Administrative Shell Activity",
      severity: "High",
      confidence: 86,
      tactic: "Execution",
      matched_event_ids: ["evt-1004"],
      recommendation: "Inspect the endpoint process tree and confirm whether the activity matches expected admin work."
    },
    {
      id: "det-2003",
      name: "Privileged Group Modification Attempt",
      severity: "Critical",
      confidence: 94,
      tactic: "Privilege Escalation",
      matched_event_ids: ["evt-1005"],
      recommendation: "Audit group membership changes, revoke unauthorized access, and preserve identity logs."
    },
    {
      id: "det-2004",
      name: "Discovery Followed by Large Outbound Transfer",
      severity: "Critical",
      confidence: 92,
      tactic: "Exfiltration",
      matched_event_ids: ["evt-1006", "evt-1007"],
      recommendation: "Contain affected host, review outbound destination, and start data exposure assessment."
    }
  ],
  timeline: [
    {
      timestamp: "2026-04-27T22:04:00Z",
      title: "Failed login pattern begins",
      description: "finance.admin shows repeated failed authentication attempts against NYC-WKS-014.",
      tactic: "Credential Access",
      severity: "medium"
    },
    {
      timestamp: "2026-04-27T22:07:00Z",
      title: "Unusual successful login",
      description: "The account successfully authenticates from a source not normally associated with this user.",
      tactic: "Initial Access",
      severity: "high"
    },
    {
      timestamp: "2026-04-27T22:09:00Z",
      title: "Suspicious shell-like admin activity",
      description: "Endpoint telemetry records an administrative command pattern for defensive training analysis.",
      tactic: "Execution",
      severity: "high"
    },
    {
      timestamp: "2026-04-27T22:11:00Z",
      title: "Privilege change attempt",
      description: "Identity telemetry flags an attempted admin group membership change.",
      tactic: "Privilege Escalation",
      severity: "critical"
    },
    {
      timestamp: "2026-04-27T22:13:00Z",
      title: "File discovery activity",
      description: "Synthetic endpoint telemetry indicates sensitive directory discovery behavior.",
      tactic: "Discovery",
      severity: "high"
    },
    {
      timestamp: "2026-04-27T22:16:00Z",
      title: "Large outbound transfer",
      description: "Network telemetry flags an unusual outbound transfer volume from the target host.",
      tactic: "Exfiltration",
      severity: "critical"
    }
  ],
  report_markdown: `# AdverSim Incident Report

## Executive Summary

AdverSim generated a safe synthetic Credential Compromise Chain scenario for finance.admin on NYC-WKS-014. The detection engine identified 4 suspicious activity clusters with overall Critical severity and 92% confidence.

## Recommended Response

- Validate the user's recent authentication activity.
- Review endpoint process and identity logs for the affected host.
- Contain the endpoint if suspicious activity is confirmed.
- Preserve relevant telemetry for incident handling.

## Safety Note

This report is generated only from synthetic defensive telemetry.`
};
