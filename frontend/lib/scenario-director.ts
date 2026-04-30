import type {
  CaseDebrief,
  EvidenceEvent,
  ScenarioCase,
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  TrainingMode
} from "@/types/adversim";
import {
  scenarioDifficulties,
  scenarioFamilies,
  scenarioRandomnessLevels,
  trainingModes
} from "@/lib/scenario-catalog";

export {
  scenarioDifficulties,
  scenarioFamilies,
  scenarioRandomnessLevels,
  trainingModes
} from "@/lib/scenario-catalog";

type EventTemplate = {
  source: string;
  summary: string;
  plain_english: string;
  severity: EvidenceEvent["severity"];
  tags: string[];
  source_ref?: string;
};

type ScenarioTemplate = {
  family: ScenarioFamily;
  titles: string[];
  briefings: string[];
  attackerProfiles: string[];
  expectedFindings: string[];
  recommendedResponse: string[];
  preventionLessons: string[];
  keyEvents: EventTemplate[];
  decoyEvents: EventTemplate[];
};

const users = [
  "finance.admin",
  "lisa.chen@adversim.co",
  "morgan.ellis",
  "hr.manager",
  "program.contractor",
  "samir.patel",
  "jordan.reed",
  "maya.okafor",
  "ops.service",
  "casey.nguyen",
  "devops.lead",
  "marketing.contractor",
  "sysadmin.service",
  "j.smith@adversim.co",
  "vendor.api.svc",
  "ceo.exec",
  "a.rodriguez@adversim.co",
  "sre.platform",
  "payroll.clerk",
  "legal.review",
  "sales.ops",
  "iam.sync.svc",
  "backup.operator",
  "field.tech",
  "data.scientist",
  "n.kim@adversim.co",
  "contractor.temp7",
  "helpdesk.tier2",
  "security.analyst",
  "svc-build-runner"
];

const hosts = [
  "NYC-WKS-014",
  "NYC-WKS-015",
  "NYC-FIN-021",
  "SEA-LAP-008",
  "ATL-HR-044",
  "DAL-VDI-102",
  "CHI-WKS-033",
  "AUS-ENG-118",
  "BOS-SRV-007",
  "PHX-LAP-062",
  "NYC-SRV-099",
  "AWS-EC2-PROD",
  "LON-WKS-212",
  "AZURE-AD-SYNC",
  "VDI-GUEST-404",
  "SFO-MAC-027",
  "IAD-JUMP-003",
  "AMS-DB-014",
  "GCP-GKE-NODE-17",
  "MIA-CALL-056",
  "TOR-FIN-APP-02",
  "SGP-VDI-118",
  "DEN-BUILD-009",
  "AWS-LAMBDA-AUTH",
  "AZURE-FS-021",
  "LON-SRV-DLP-01",
  "SEA-SRE-044",
  "NYC-DC-002",
  "REMOTE-BYOD-711",
  "EUC-KIOSK-018"
];

const commonDecoyEvents: EventTemplate[] = [
  {
    source: "Calendar",
    summary: "Routine calendar sync completed from a trusted mobile client",
    plain_english: "This is normal collaboration traffic and does not support the case narrative.",
    severity: "Low",
    tags: ["decoy", "collaboration"]
  },
  {
    source: "Patch",
    summary: "Approved software update window completed successfully",
    plain_english: "This is expected maintenance activity and belongs outside the incident story.",
    severity: "Low",
    tags: ["decoy", "patch"]
  },
  {
    source: "Printer",
    summary: "Printer authentication event recorded from a nearby subnet",
    plain_english: "This is ordinary office noise, not meaningful attacker behavior.",
    severity: "Low",
    tags: ["decoy", "office-noise"]
  },
  {
    source: "VPN",
    summary: "Known VPN device completed a healthy session refresh",
    plain_english: "This access looks normal because the device and session pattern are familiar.",
    severity: "Low",
    tags: ["decoy", "vpn"]
  },
  {
    source: "Inventory",
    summary: "Asset inventory collector refreshed endpoint metadata",
    plain_english: "This system-management event is useful background context, but not suspicious evidence.",
    severity: "Low",
    tags: ["decoy", "inventory"]
  }
];

const templates: Record<ScenarioFamily, ScenarioTemplate> = {
  "Credential Compromise": {
    family: "Credential Compromise",
    titles: ["Credential Compromise Chain", "Privileged Login Anomaly", "Authentication Pressure Case"],
    briefings: [
      "A suspicious authentication pattern has been detected involving a privileged account. Decide whether this is normal behavior or a likely compromise chain.",
      "Several identity and endpoint signals landed close together. Objective: separate meaningful clues from normal background activity."
    ],
    attackerProfiles: ["Opportunistic identity-focused actor", "Credential misuse emulator", "Lab-only adversary persona"],
    expectedFindings: [
      "Repeated failed logins followed by a successful unusual login",
      "Post-login endpoint activity on the affected host",
      "Outbound transfer signal after discovery behavior"
    ],
    recommendedResponse: [
      "Reset the affected account password and review MFA status",
      "Revoke active sessions for the affected identity",
      "Review endpoint process telemetry on the affected host",
      "Preserve authentication, endpoint, and network logs"
    ],
    preventionLessons: ["Enable MFA", "Alert on failed-login bursts", "Monitor privileged account behavior"],
    keyEvents: [
      {
        source: "Auth",
        summary: "Multiple failed login attempts for the target account",
        plain_english: "Someone repeatedly tried to access this account and failed.",
        severity: "Medium",
        tags: ["identity", "credential-access"]
      },
      {
        source: "Cloud Identity",
        summary: "Successful sign-in from an unfamiliar source after failures",
        plain_english: "The login finally succeeded from a source that does not match the normal pattern.",
        severity: "High",
        tags: ["identity", "initial-access"]
      },
      {
        source: "Endpoint",
        summary: "Administrative shell telemetry observed on the assigned workstation",
        plain_english: "After the sign-in, the host showed administrative command activity that defenders should review.",
        severity: "High",
        tags: ["endpoint", "execution"]
      },
      {
        source: "Network",
        summary: "Outbound transfer volume exceeded the normal baseline",
        plain_english: "The host sent more data out than it normally does during this window.",
        severity: "Critical",
        tags: ["network", "exfiltration"]
      }
    ],
    decoyEvents: [
      {
        source: "Endpoint",
        summary: "Routine collaboration app update completed",
        plain_english: "This looks like normal software maintenance and does not align with the suspicious sequence.",
        severity: "Low",
        tags: ["decoy", "software-update"]
      },
      {
        source: "Helpdesk",
        summary: "Password reset ticket closed for a different user",
        plain_english: "This is identity-related, but it involves another user and does not fit the timeline.",
        severity: "Low",
        tags: ["decoy", "helpdesk"]
      },
      {
        source: "Printer",
        summary: "Normal printer authentication event from the same subnet",
        plain_english: "This is routine office noise and not part of the case.",
        severity: "Low",
        tags: ["decoy", "office-noise"]
      }
    ]
  },
  "Insider Data Drift": {
    family: "Insider Data Drift",
    titles: ["Insider Data Drift", "Sensitive File Handling Case", "External Share Review"],
    briefings: [
      "A data access pattern changed for one user. Decide whether this looks like normal work or a policy risk that needs escalation.",
      "File, DLP, and SaaS audit signals suggest a data handling concern. Identify the clues that belong together."
    ],
    attackerProfiles: ["Ambiguous insider-risk scenario", "Policy-risk emulator", "Data stewardship training case"],
    expectedFindings: [
      "After-hours sensitive folder access",
      "DLP labels matched in a broad access burst",
      "External sharing and upload drift after staging behavior"
    ],
    recommendedResponse: [
      "Validate business context with the data owner",
      "Review external sharing permissions",
      "Preserve DLP and SaaS audit evidence",
      "Escalate according to insider-risk policy"
    ],
    preventionLessons: ["Use least privilege", "Monitor sensitive labels", "Require review for external sharing"],
    keyEvents: [
      {
        source: "Fileshare",
        summary: "After-hours access to sensitive finance folders",
        plain_english: "The user accessed sensitive folders outside their usual working pattern.",
        severity: "Medium",
        tags: ["fileshare", "discovery"]
      },
      {
        source: "DLP",
        summary: "Sensitive labels matched during a broad file access burst",
        plain_english: "The files touched included sensitive categories that defenders should protect.",
        severity: "High",
        tags: ["dlp", "collection"]
      },
      {
        source: "SaaS Audit",
        summary: "External sharing event created for a restricted document set",
        plain_english: "Data moved from internal access toward external exposure.",
        severity: "High",
        tags: ["saas", "sharing"]
      },
      {
        source: "Proxy",
        summary: "Upload volume exceeded the user's normal baseline",
        plain_english: "The user's outbound upload activity was higher than expected.",
        severity: "Critical",
        tags: ["network", "exfiltration"]
      }
    ],
    decoyEvents: [
      {
        source: "VPN",
        summary: "Normal VPN login from a known device",
        plain_english: "This is related to access, but it matches the user's normal device pattern.",
        severity: "Low",
        tags: ["decoy", "vpn"]
      },
      {
        source: "Calendar",
        summary: "Team meeting invite updated near the alert window",
        plain_english: "This is business activity, but not evidence of data movement.",
        severity: "Low",
        tags: ["decoy", "collaboration"]
      },
      {
        source: "Storage",
        summary: "Automatic backup job completed for a shared folder",
        plain_english: "This is scheduled system activity, not user-driven data handling.",
        severity: "Low",
        tags: ["decoy", "backup"]
      }
    ]
  },
  "Cloud Account Takeover": {
    family: "Cloud Account Takeover",
    titles: ["Cloud Login Anomaly", "Impossible Travel Review", "New Device Cloud Session"],
    briefings: [
      "Cloud sign-in telemetry shows an unusual access pattern. Identify which events support account takeover risk.",
      "A user session changed location and device context quickly. Decide what belongs in the incident narrative."
    ],
    attackerProfiles: ["Cloud identity anomaly emulator", "Session-risk training actor", "Lab-only cloud access persona"],
    expectedFindings: [
      "Impossible travel or unfamiliar location",
      "New device login followed by mailbox or SaaS access",
      "Risky session requiring token/session review"
    ],
    recommendedResponse: [
      "Revoke active cloud sessions",
      "Require MFA re-authentication",
      "Review mailbox and SaaS audit logs",
      "Confirm user travel and device ownership"
    ],
    preventionLessons: ["Enable conditional access", "Alert on impossible travel", "Require device compliance"],
    keyEvents: [
      {
        source: "Cloud Identity",
        summary: "Impossible travel signal between two distant locations",
        plain_english: "The account appeared in two places too quickly to be normal.",
        severity: "High",
        tags: ["cloud", "identity"]
      },
      {
        source: "Device Trust",
        summary: "New unmanaged device started a cloud session",
        plain_english: "The login came from a device the organization does not recognize.",
        severity: "High",
        tags: ["device", "cloud"]
      },
      {
        source: "Mail Audit",
        summary: "Mailbox rule review activity occurred after the new session",
        plain_english: "The account touched mailbox settings shortly after the unusual login.",
        severity: "High",
        tags: ["mail", "post-login"]
      }
    ],
    decoyEvents: [
      {
        source: "Helpdesk",
        summary: "Routine password reset completed three days earlier",
        plain_english: "This is identity-related, but it is too far outside the incident window.",
        severity: "Low",
        tags: ["decoy", "password-reset"]
      },
      {
        source: "Cloud Storage",
        summary: "Document preview event from a managed device",
        plain_english: "This access came from a known managed device and is likely normal.",
        severity: "Low",
        tags: ["decoy", "storage"]
      },
      {
        source: "Calendar",
        summary: "Calendar sync completed from a known mobile app",
        plain_english: "This is expected cloud synchronization noise.",
        severity: "Low",
        tags: ["decoy", "calendar"]
      }
    ]
  },
  "Endpoint Activity": {
    family: "Endpoint Activity",
    titles: ["Endpoint Activity Review", "Administrative Shell Signal", "Process Lineage Case"],
    briefings: [
      "Endpoint telemetry shows unusual process lineage. Identify which clues are suspicious without treating normal admin activity as malicious.",
      "A workstation generated process and script logging signals. Build the defensive story from safe synthetic telemetry."
    ],
    attackerProfiles: ["Endpoint behavior emulator", "Administrative misuse training case", "Synthetic process-lineage actor"],
    expectedFindings: [
      "Unusual parent-child process relationship",
      "Administrative shell signal outside normal baseline",
      "Follow-on file discovery or network activity"
    ],
    recommendedResponse: [
      "Review process lineage and parent process context",
      "Validate whether admin maintenance was scheduled",
      "Collect endpoint telemetry around the alert window",
      "Triage adjacent identity and network signals"
    ],
    preventionLessons: ["Baseline admin tooling", "Alert on unusual process chains", "Correlate endpoint events with identity context"],
    keyEvents: [
      {
        source: "EDR",
        summary: "Office application spawned administrative shell telemetry",
        plain_english: "A normal app appeared to launch admin-style activity, which defenders should investigate.",
        severity: "High",
        tags: ["edr", "process"]
      },
      {
        source: "Endpoint",
        summary: "Script block metadata contained unusual encoded-looking parameters",
        plain_english: "The event is inert training data, but it teaches analysts to inspect suspicious script metadata.",
        severity: "Medium",
        tags: ["endpoint", "script"]
      },
      {
        source: "EDR",
        summary: "Command frequency exceeded workstation baseline",
        plain_english: "The host ran more administrative-style commands than normal.",
        severity: "High",
        tags: ["edr", "baseline"]
      }
    ],
    decoyEvents: [
      {
        source: "Patch",
        summary: "Approved software update service restarted",
        plain_english: "This is expected patch activity and not part of the suspicious process chain.",
        severity: "Low",
        tags: ["decoy", "patch"]
      },
      {
        source: "EDR",
        summary: "Known backup agent scanned local files",
        plain_english: "This looks noisy, but the process is a known approved backup agent.",
        severity: "Low",
        tags: ["decoy", "backup"]
      },
      {
        source: "Inventory",
        summary: "Asset inventory refresh completed on the workstation",
        plain_english: "This is normal system management telemetry.",
        severity: "Low",
        tags: ["decoy", "inventory"]
      }
    ]
  },
  "Exfiltration Signal": {
    family: "Exfiltration Signal",
    titles: ["Outbound Transfer Signal", "Data Egress Review", "Network Pulse Investigation"],
    briefings: [
      "Network and DNS telemetry show a possible data egress pattern. Identify the sequence that makes the case stronger.",
      "Outbound activity increased after internal discovery signals. Decide which evidence belongs in the report."
    ],
    attackerProfiles: ["Data egress emulator", "Network anomaly training case", "Lab-only transfer persona"],
    expectedFindings: [
      "Discovery or staging before outbound transfer",
      "Outbound bytes exceeded host baseline",
      "DNS or proxy signal aligned with the transfer window"
    ],
    recommendedResponse: [
      "Preserve proxy, DNS, and firewall logs",
      "Validate destination category and business need",
      "Review host file access before transfer",
      "Block or monitor suspicious egress path according to policy"
    ],
    preventionLessons: ["Monitor egress baselines", "Correlate DNS and proxy telemetry", "Tag sensitive data movement"],
    keyEvents: [
      {
        source: "Fileshare",
        summary: "Sensitive directory enumeration preceded transfer activity",
        plain_english: "The host looked through sensitive folders before the network spike.",
        severity: "High",
        tags: ["fileshare", "discovery"]
      },
      {
        source: "DNS",
        summary: "Lab-only archive domain observed during transfer window",
        plain_english: "A synthetic domain appeared at the same time as the outbound activity.",
        severity: "Medium",
        tags: ["dns", "network"]
      },
      {
        source: "Firewall",
        summary: "Outbound bytes exceeded host baseline by a large margin",
        plain_english: "The workstation sent much more data out than usual.",
        severity: "Critical",
        tags: ["firewall", "egress"]
      }
    ],
    decoyEvents: [
      {
        source: "Proxy",
        summary: "Streaming media traffic from a break room subnet",
        plain_english: "This is network noise from a different subnet and does not match the target host.",
        severity: "Low",
        tags: ["decoy", "network-noise"]
      },
      {
        source: "DNS",
        summary: "Common software update domain resolved successfully",
        plain_english: "This domain is expected update traffic, not part of the suspicious chain.",
        severity: "Low",
        tags: ["decoy", "dns"]
      },
      {
        source: "Firewall",
        summary: "Allowed connection to internal reporting service",
        plain_english: "This is internal traffic and does not support an egress finding.",
        severity: "Low",
        tags: ["decoy", "internal"]
      }
    ]
  },
  "Lateral Movement": {
    family: "Lateral Movement",
    titles: ["Lateral Movement Drill", "Internal Pivot Investigation", "East-West Access Review"],
    briefings: [
      "Identity and endpoint signals suggest a user context may have moved between internal systems. Identify which clues prove the movement path and which are ordinary admin noise.",
      "Several internal access events landed close together across workstations and servers. Build the defensive story without assuming every remote-looking event is malicious."
    ],
    attackerProfiles: ["Internal movement emulator", "East-west telemetry training case", "Synthetic pivot-path actor"],
    expectedFindings: [
      "New internal authentication path from the first workstation",
      "Administrative access pattern on a second host",
      "Endpoint telemetry aligns with the internal movement window"
    ],
    recommendedResponse: [
      "Review source and destination host authentication logs",
      "Validate whether the administrative access was scheduled",
      "Check privileged group membership and recent session activity",
      "Preserve endpoint and identity telemetry for both hosts"
    ],
    preventionLessons: ["Segment sensitive systems", "Alert on unusual east-west access", "Review privileged session patterns"],
    keyEvents: [
      {
        source: "Auth",
        summary: "New internal logon path observed from the target workstation",
        plain_english: "The account accessed a system it does not normally touch from this workstation.",
        severity: "Medium",
        tags: ["identity", "east-west"]
      },
      {
        source: "Endpoint",
        summary: "Remote administration telemetry appeared on a second host",
        plain_english: "A second machine entered the story, which is a key clue for movement between systems.",
        severity: "High",
        tags: ["endpoint", "remote-admin"]
      },
      {
        source: "Directory",
        summary: "Privileged resource access check occurred after the internal logon",
        plain_english: "The account looked at access to a sensitive internal resource after moving hosts.",
        severity: "High",
        tags: ["identity", "privilege-review"]
      },
      {
        source: "Network",
        summary: "East-west session volume exceeded the workstation baseline",
        plain_english: "The host talked to internal systems more than usual during the alert window.",
        severity: "Medium",
        tags: ["network", "lateral-movement"]
      },
      {
        source: "EDR",
        summary: "Process lineage on the destination host matched the access window",
        plain_english: "Endpoint timing on the second host lines up with the suspicious internal access.",
        severity: "High",
        tags: ["edr", "correlation"]
      }
    ],
    decoyEvents: [
      {
        source: "Helpdesk",
        summary: "Approved remote support session closed for a different workstation",
        plain_english: "This looks similar, but it belongs to another host and does not fit the case timeline.",
        severity: "Low",
        tags: ["decoy", "support"]
      },
      {
        source: "Directory",
        summary: "Group policy refresh completed across the subnet",
        plain_english: "This is broad normal domain activity, not a user-driven movement clue.",
        severity: "Low",
        tags: ["decoy", "policy"]
      },
      {
        source: "Network",
        summary: "Internal monitoring probe checked service health",
        plain_english: "The source is a known monitor, so this should not be selected as user evidence.",
        severity: "Low",
        tags: ["decoy", "monitoring"]
      }
    ]
  },
  "Ransomware Precursor": {
    family: "Ransomware Precursor",
    titles: ["Ransomware Precursor Review", "Pre-Encryption Signal Drill", "Backup Risk Investigation"],
    briefings: [
      "Several defensive signals resemble early-stage ransomware preparation, but no real malware or encryption is present. Identify the warning signs defenders should escalate.",
      "Endpoint and file telemetry show a risky pre-impact pattern. Separate the meaningful warning signs from routine maintenance events."
    ],
    attackerProfiles: ["Impact-prevention training case", "Synthetic ransomware precursor emulator", "Pre-impact defensive drill"],
    expectedFindings: [
      "Backup or recovery-related access anomaly",
      "Rapid file-touch pattern before impact",
      "Endpoint behavior that increases urgency before damage occurs"
    ],
    recommendedResponse: [
      "Validate backup access and recent administrative changes",
      "Review file-change telemetry around the alert window",
      "Isolate the affected host if policy thresholds are met",
      "Confirm recovery controls and preserve endpoint logs"
    ],
    preventionLessons: ["Protect backups with separate access controls", "Alert on rapid file-change bursts", "Correlate endpoint and file telemetry before impact"],
    keyEvents: [
      {
        source: "Backup",
        summary: "Backup catalog access anomaly observed before file-change burst",
        plain_english: "Activity touched recovery-related telemetry before the file pattern changed, which raises urgency.",
        severity: "High",
        tags: ["backup", "pre-impact"]
      },
      {
        source: "Fileshare",
        summary: "Rapid file metadata changes exceeded the department baseline",
        plain_english: "The host changed many file records faster than normal, a warning sign defenders should review.",
        severity: "High",
        tags: ["fileshare", "file-change"]
      },
      {
        source: "EDR",
        summary: "Unsigned archive utility staging metadata observed in lab telemetry",
        plain_english: "This is inert synthetic data, but it teaches analysts to question unusual staging behavior.",
        severity: "Medium",
        tags: ["edr", "staging"]
      },
      {
        source: "Endpoint",
        summary: "High-volume rename-like pattern appeared in a controlled test folder",
        plain_english: "A burst of file-name changes can be an early warning sign even before impact occurs.",
        severity: "Critical",
        tags: ["endpoint", "impact-prevention"]
      },
      {
        source: "Identity",
        summary: "Temporary administrative access was granted shortly before the file burst",
        plain_english: "New admin context before risky file behavior makes the case more serious.",
        severity: "High",
        tags: ["identity", "privilege"]
      }
    ],
    decoyEvents: [
      {
        source: "Backup",
        summary: "Scheduled backup verification completed successfully",
        plain_english: "This is expected recovery-control maintenance and not part of the warning sequence.",
        severity: "Low",
        tags: ["decoy", "backup"]
      },
      {
        source: "Storage",
        summary: "User restored one deleted document from self-service recovery",
        plain_english: "This is normal user recovery behavior and does not match a broad risky pattern.",
        severity: "Low",
        tags: ["decoy", "restore"]
      },
      {
        source: "Endpoint",
        summary: "Approved endpoint protection scan completed",
        plain_english: "Security tooling activity can be noisy, but this scan is approved and expected.",
        severity: "Low",
        tags: ["decoy", "security-tooling"]
      }
    ]
  },
  "Supply Chain Compromise": {
    family: "Supply Chain Compromise",
    titles: ["Supply Chain Trust Drift", "Vendor Update Review", "Third-Party Package Signal"],
    briefings: [
      "A trusted vendor workflow generated unusual package and build telemetry. Identify the clues that suggest supply-chain risk without assuming a real compromise.",
      "CI, package, and endpoint signals show a suspicious trust-chain change. Decide which events belong in the defensive incident story."
    ],
    attackerProfiles: ["Synthetic vendor-risk persona", "Third-party trust emulator", "Build pipeline training actor"],
    expectedFindings: [
      "Package integrity or publisher context changed",
      "Build runner activity diverged from normal release behavior",
      "Endpoint or identity evidence aligned with the suspicious update window"
    ],
    recommendedResponse: [
      "Pause the affected package or vendor update workflow",
      "Validate checksums, publisher identity, and release approval",
      "Review CI runner telemetry and artifact provenance",
      "Notify application owners and preserve build logs"
    ],
    preventionLessons: ["Pin trusted dependencies", "Verify artifact provenance", "Monitor CI runner behavior"],
    keyEvents: [
      {
        source: "CI/CD",
        summary: "Build runner pulled a package outside the approved release window",
        plain_english: "The build system used a dependency at a time that does not match the normal release process.",
        severity: "High",
        tags: ["supply-chain", "ci", "execution"]
      },
      {
        source: "Package Registry",
        summary: "Publisher metadata changed before the dependency update",
        plain_english: "The package trust details shifted before the update, which defenders should review.",
        severity: "High",
        tags: ["supply-chain", "identity", "package"]
      },
      {
        source: "Endpoint",
        summary: "Developer workstation downloaded a newly staged artifact",
        plain_english: "The endpoint received an artifact tied to the suspicious build window.",
        severity: "Medium",
        tags: ["endpoint", "artifact", "collection"]
      },
      {
        source: "Repository Audit",
        summary: "Release configuration changed without a matching change ticket",
        plain_english: "The repo configuration changed, but the normal approval trail is missing.",
        severity: "Critical",
        tags: ["repository", "supply-chain", "privilege"]
      }
    ],
    decoyEvents: [
      {
        source: "CI/CD",
        summary: "Nightly test workflow completed on an unrelated branch",
        plain_english: "This looks like build activity, but it is routine and outside the affected release path.",
        severity: "Low",
        tags: ["decoy", "ci"]
      },
      {
        source: "Repository Audit",
        summary: "Documentation-only pull request merged successfully",
        plain_english: "A docs merge is normal repository activity and does not support the case.",
        severity: "Low",
        tags: ["decoy", "repository"]
      },
      {
        source: "Package Registry",
        summary: "Approved internal package cache refresh completed",
        plain_english: "This cache refresh is expected platform maintenance, not suspicious evidence.",
        severity: "Low",
        tags: ["decoy", "package"]
      }
    ]
  },
  "Spear-Phishing Campaign": {
    family: "Spear-Phishing Campaign",
    titles: ["Spear-Phishing Triage", "Targeted Email Investigation", "Mailbox Lure Review"],
    briefings: [
      "Mail and identity telemetry show a targeted message followed by suspicious account activity. Select the clues that prove the campaign path.",
      "A user received a convincing business-themed message, then several access signals shifted. Identify what matters and what is normal mailbox noise."
    ],
    attackerProfiles: ["Synthetic social-engineering emulator", "Mailbox campaign training actor", "Targeted lure persona"],
    expectedFindings: [
      "Targeted inbound message with risky attachment or link metadata",
      "User interaction followed by unusual sign-in or mailbox activity",
      "Follow-on cloud or endpoint signal that increases campaign confidence"
    ],
    recommendedResponse: [
      "Quarantine related messages and review recipients",
      "Revoke affected sessions and validate MFA posture",
      "Preserve mail gateway, identity, and endpoint telemetry",
      "Coach users on reporting targeted messages"
    ],
    preventionLessons: ["Use phishing-resistant MFA", "Alert on mailbox rule changes", "Correlate mail clicks with identity telemetry"],
    keyEvents: [
      {
        source: "Mail Gateway",
        summary: "Targeted invoice-themed message reached the target inbox",
        plain_english: "The message theme matches the user's role and deserves review as a targeted lure.",
        severity: "Medium",
        tags: ["email", "phishing", "initial-access"]
      },
      {
        source: "Mail Gateway",
        summary: "URL rewrite telemetry recorded a user interaction with the message",
        plain_english: "The user interacted with the message, which links the email to the later account activity.",
        severity: "High",
        tags: ["email", "user-interaction", "credential-access"]
      },
      {
        source: "Cloud Identity",
        summary: "New sign-in appeared shortly after the mail interaction",
        plain_english: "The account was accessed from a new context soon after the suspicious email event.",
        severity: "High",
        tags: ["cloud", "identity", "initial-access"]
      },
      {
        source: "Mail Audit",
        summary: "Mailbox forwarding rule review occurred after the new session",
        plain_english: "Mailbox settings changed during the suspicious session window, raising campaign confidence.",
        severity: "Critical",
        tags: ["mail", "post-login", "exfiltration"]
      }
    ],
    decoyEvents: [
      {
        source: "Mail Gateway",
        summary: "Bulk newsletter delivered to the marketing distribution list",
        plain_english: "This is broad newsletter traffic, not a targeted campaign clue.",
        severity: "Low",
        tags: ["decoy", "email"]
      },
      {
        source: "Calendar",
        summary: "Meeting reminder email opened from a managed mobile client",
        plain_english: "This is normal mailbox usage and does not support the campaign story.",
        severity: "Low",
        tags: ["decoy", "calendar"]
      },
      {
        source: "Helpdesk",
        summary: "Awareness training reminder sent to all employees",
        plain_english: "Security training email is expected and unrelated to the suspicious user sequence.",
        severity: "Low",
        tags: ["decoy", "training"]
      }
    ]
  },
  "Web API Exploitation": {
    family: "Web API Exploitation",
    titles: ["Web API Abuse Signal", "Public Endpoint Investigation", "API Rate Anomaly Review"],
    briefings: [
      "API gateway, identity, and application telemetry show unusual access to a public endpoint. Identify which events support abuse of the service.",
      "A public API generated a noisy request pattern with a few strong clues. Separate normal traffic from the defensive findings."
    ],
    attackerProfiles: ["Synthetic API-abuse emulator", "Public endpoint training persona", "Application telemetry lab actor"],
    expectedFindings: [
      "API request rate or route mix changed sharply",
      "Authentication or token errors clustered around sensitive endpoints",
      "Application and gateway logs aligned on the same target host"
    ],
    recommendedResponse: [
      "Review API gateway logs and affected routes",
      "Validate authentication failures and token scope",
      "Apply rate-limit or WAF policy according to procedure",
      "Preserve application logs for the suspicious window"
    ],
    preventionLessons: ["Monitor API route baselines", "Alert on token error bursts", "Enforce least-privilege API scopes"],
    keyEvents: [
      {
        source: "API Gateway",
        summary: "Request rate exceeded the endpoint baseline for a sensitive route",
        plain_english: "The public endpoint received more requests than it normally does.",
        severity: "High",
        tags: ["api", "network", "discovery"]
      },
      {
        source: "Identity",
        summary: "Token-scope errors clustered around the same API route",
        plain_english: "The requests repeatedly asked for access the token did not have.",
        severity: "High",
        tags: ["api", "identity", "credential-access"]
      },
      {
        source: "Application",
        summary: "Unusual parameter pattern was normalized as inert training text",
        plain_english: "The app observed strange request shape, represented safely as non-functional lab data.",
        severity: "Medium",
        tags: ["api", "application", "execution"]
      },
      {
        source: "WAF",
        summary: "Policy matched repeated probing against the protected endpoint",
        plain_english: "The protective layer saw repeated suspicious access attempts to the same route.",
        severity: "Critical",
        tags: ["api", "waf", "network"]
      }
    ],
    decoyEvents: [
      {
        source: "API Gateway",
        summary: "Health-check requests completed from the internal monitor",
        plain_english: "This is expected monitoring traffic and should not be selected.",
        severity: "Low",
        tags: ["decoy", "monitoring"]
      },
      {
        source: "Application",
        summary: "Routine customer export job used an approved service token",
        plain_english: "The export job is authorized and does not match the suspicious route pattern.",
        severity: "Low",
        tags: ["decoy", "application"]
      },
      {
        source: "CDN",
        summary: "Static asset cache miss increased during a product launch",
        plain_english: "This traffic spike is explainable business context, not API abuse evidence.",
        severity: "Low",
        tags: ["decoy", "cdn"]
      }
    ]
  }
};

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function makeRandom(seed: string) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length) % items.length];
}

function shuffle<T>(items: T[], random: () => number) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function formatClock(minutesAfterStart: number) {
  const startHour = 8;
  const hour24 = startHour + Math.floor(minutesAfterStart / 60);
  const minute = minutesAfterStart % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
  return `${hour12.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

function formatRealtimeClock(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function realtimeTimestamps(count: number, random: () => number) {
  let cursor = new Date();

  return Array.from({ length: count }, (_, index) => {
    if (index > 0) {
      const minutesBack = 2 + Math.floor(random() * 9);
      const secondsBack = Math.floor(random() * 50);
      cursor = new Date(cursor.getTime() - (minutesBack * 60 + secondsBack) * 1000);
    }

    return formatRealtimeClock(cursor);
  });
}

function severityForDifficulty(difficulty: ScenarioDifficulty, random: () => number): ScenarioCase["severity"] {
  if (difficulty === "Beginner") {
    return pick(["Medium", "High"], random);
  }

  if (difficulty === "Intermediate") {
    return pick(["Medium", "High", "Critical"], random);
  }

  return pick(["High", "Critical"], random);
}

function confidenceForSeverity(severity: ScenarioCase["severity"], random: () => number) {
  const ranges = {
    Low: [54, 68],
    Medium: [66, 78],
    High: [78, 89],
    Critical: [88, 96]
  } satisfies Record<ScenarioCase["severity"], [number, number]>;
  const [min, max] = ranges[severity];
  return min + Math.floor(random() * (max - min + 1));
}

function sourceRefForEvent(family: ScenarioFamily, event: EventTemplate, isKeyEvidence: boolean) {
  if (event.source_ref) {
    return event.source_ref;
  }

  if (!isKeyEvidence) {
    return "AdverSim noise";
  }

  const tags = new Set(event.tags);

  if (tags.has("credential-access")) return "MITRE T1110";
  if (tags.has("initial-access")) return "MITRE T1078";
  if (tags.has("execution") || tags.has("script")) return "MITRE T1059";
  if (tags.has("discovery")) return "MITRE T1083";
  if (tags.has("exfiltration") || tags.has("egress")) return "MITRE T1041";
  if (tags.has("sharing") || tags.has("collection")) return "MITRE T1530";
  if (tags.has("cloud") || tags.has("post-login")) return "MITRE T1078";
  if (tags.has("remote-admin") || tags.has("east-west") || tags.has("lateral-movement")) return "MITRE T1021";
  if (family === "Ransomware Precursor" && tags.has("backup")) return "MITRE T1490";
  if (family === "Ransomware Precursor") return "MITRE T1486";
  if (tags.has("supply-chain") || tags.has("package")) return "MITRE T1195";
  if (tags.has("phishing") || tags.has("email")) return "MITRE T1566";
  if (tags.has("api") || tags.has("waf")) return "OWASP API telemetry";
  if (tags.has("privilege") || tags.has("privilege-review")) return "MITRE T1068";

  return "ATT&CK mapped";
}
const tacticLabels = ["Credential Access", "Execution", "Privilege Escalation", "Discovery", "Exfiltration"] as const;
const severityLabels = ["Low", "Medium", "High", "Critical"] as const;

function primaryTacticIndex(family: ScenarioFamily) {
  const indexByFamily: Record<ScenarioFamily, number> = {
    "Credential Compromise": 0,
    "Insider Data Drift": 4,
    "Cloud Account Takeover": 0,
    "Endpoint Activity": 1,
    "Exfiltration Signal": 4,
    "Lateral Movement": 3,
    "Ransomware Precursor": 1,
    "Supply Chain Compromise": 1,
    "Spear-Phishing Campaign": 0,
    "Web API Exploitation": 3
  };

  return indexByFamily[family];
}

function tacticIndexesForEvent(event: EvidenceEvent) {
  const tags = new Set(event.tags);
  const indexes = new Set<number>();

  if (tags.has("credential-access") || tags.has("identity") || tags.has("cloud") || tags.has("phishing") || tags.has("email")) indexes.add(0);
  if (tags.has("execution") || tags.has("script") || tags.has("process") || tags.has("edr") || tags.has("staging") || tags.has("impact-prevention") || tags.has("ci") || tags.has("application")) indexes.add(1);
  if (tags.has("privilege") || tags.has("privilege-review") || tags.has("remote-admin") || tags.has("repository")) indexes.add(2);
  if (tags.has("discovery") || tags.has("fileshare") || tags.has("collection") || tags.has("baseline") || tags.has("east-west") || tags.has("lateral-movement") || tags.has("correlation") || tags.has("file-change") || tags.has("api") || tags.has("supply-chain")) indexes.add(3);
  if (tags.has("exfiltration") || tags.has("egress") || tags.has("sharing") || tags.has("network") || tags.has("dlp") || tags.has("saas") || tags.has("post-login") || tags.has("waf")) indexes.add(4);

  return indexes.size ? Array.from(indexes) : [3];
}

function buildCaseChartData(family: ScenarioFamily, telemetryEvents: EvidenceEvent[]) {
  const clueEvents = telemetryEvents.filter((event) => event.is_key_evidence);
  const mappedTactics = tacticLabels.map(() => 0);
  const severityHeat = severityLabels.map(() => 0);

  for (const event of clueEvents) {
    for (const index of tacticIndexesForEvent(event)) {
      mappedTactics[index] += 1;
    }

    const severityIndex = severityLabels.indexOf(event.severity);
    if (severityIndex >= 0) {
      severityHeat[severityIndex] += 1;
    }
  }

  const primaryIndex = primaryTacticIndex(family);
  mappedTactics[primaryIndex] = Math.max(mappedTactics[primaryIndex], Math.max(...mappedTactics) + 1);

  return { mappedTactics, severityHeat };
}
export function generateScenarioCase({
  family = "Credential Compromise",
  difficulty = "Beginner",
  randomness = "Medium",
  trainingMode = "Guided",
  seed = Date.now().toString(),
  caseNumber = 1,
  procedural = false,
  realtime = false
}: {
  family?: ScenarioFamily;
  difficulty?: ScenarioDifficulty;
  randomness?: ScenarioRandomness;
  trainingMode?: TrainingMode;
  seed?: string;
  caseNumber?: number;
  procedural?: boolean;
  realtime?: boolean;
} = {}): ScenarioCase {
  const random = makeRandom(`${seed}:${family}:${difficulty}:${randomness}:${trainingMode}:${caseNumber}`);
  const template = templates[family];
  const targetUser = pick(users, random);
  const targetHost = pick(hosts, random);
  const severity = severityForDifficulty(difficulty, random);
  const confidence = confidenceForSeverity(severity, random);
  const decoyCount = procedural ? 3 : randomness === "Low" ? 2 : randomness === "Medium" ? 3 : 5;
  const keyCount = procedural ? Math.min(template.keyEvents.length, 3 + Math.floor(random() * 2)) : template.keyEvents.length;
  const selectedKeyEvents = procedural ? shuffle(template.keyEvents, random).slice(0, keyCount) : template.keyEvents;
  const decoyPool = procedural ? [...template.decoyEvents, ...commonDecoyEvents] : template.decoyEvents;
  const keyEvents = selectedKeyEvents.map((event, index) => ({ event, key: true, index }));
  const decoyEvents = shuffle(decoyPool, random).slice(0, decoyCount).map((event, index) => ({ event, key: false, index }));
  const rawEvents = procedural || trainingMode === "Blind Investigation" || randomness === "Chaos Lab"
    ? shuffle([...keyEvents, ...decoyEvents], random)
    : [...keyEvents, ...decoyEvents];
  const timestamps = realtime ? realtimeTimestamps(rawEvents.length, random) : null;
  const caseId = `ADV-2026-${caseNumber.toString().padStart(3, "0")}`;

  const telemetryEvents = rawEvents.map(({ event, key }, index): EvidenceEvent => ({
    event_id: `evt-${(index + 1).toString().padStart(3, "0")}`,
    timestamp: timestamps?.[index] ?? formatClock(30 + index * (randomness === "Chaos Lab" ? 17 : 12)),
    source: event.source,
    summary: `${event.summary} for ${targetUser}`,
    plain_english: event.plain_english,
    severity: event.severity,
    user: targetUser,
    host: key ? targetHost : pick(hosts, random),
    is_key_evidence: key,
    tags: event.tags,
    source_ref: sourceRefForEvent(family, event, key)
  }));

  const keyEvidenceIds = telemetryEvents.filter((event) => event.is_key_evidence).map((event) => event.event_id);
  const decoyIds = telemetryEvents.filter((event) => !event.is_key_evidence).map((event) => event.event_id);
  const falseLead = telemetryEvents.find((event) => !event.is_key_evidence)?.summary ?? "Routine background activity";
  const chartData = buildCaseChartData(family, telemetryEvents);

  return {
    case_id: caseId,
    title: pick(template.titles, random),
    scenario_family: family,
    difficulty,
    severity,
    target_user: targetUser,
    target_host: targetHost,
    attacker_profile: pick(template.attackerProfiles, random),
    false_lead: falseLead,
    confidence,
    case_briefing: pick(template.briefings, random),
    telemetry_events: telemetryEvents,
    key_evidence_event_ids: keyEvidenceIds,
    decoy_event_ids: decoyIds,
    expected_findings: template.expectedFindings,
    recommended_response: template.recommendedResponse,
    prevention_lessons: template.preventionLessons,
    chartData
  };
}

const quickStartFamilies = scenarioFamilies;

export function generateQuickStartCase({
  seed = `quick:${Date.now()}:${Math.random()}`,
  caseNumber = 1,
  difficulty = "Beginner",
  trainingMode = "Guided",
  randomness = "Medium"
}: {
  seed?: string;
  caseNumber?: number;
  difficulty?: ScenarioDifficulty;
  trainingMode?: TrainingMode;
  randomness?: ScenarioRandomness;
} = {}) {
  const random = makeRandom(seed);
  const family = pick(quickStartFamilies, random);

  return generateScenarioCase({
    family,
    difficulty,
    randomness,
    trainingMode,
    seed,
    caseNumber,
    procedural: true,
    realtime: true
  });
}
export function generateDailyThreatQueue(seed = new Date().toDateString()) {
  const families = scenarioFamilies;
  const difficulties: ScenarioDifficulty[] = [
    "Beginner",
    "Intermediate",
    "Expert",
    "Intermediate",
    "Beginner",
    "Expert",
    "Intermediate",
    "Expert",
    "Intermediate",
    "Expert"
  ];
  const randomness: ScenarioRandomness[] = [
    "Low",
    "Medium",
    "Medium",
    "Chaos Lab",
    "Low",
    "Medium",
    "Medium",
    "Chaos Lab",
    "Medium",
    "Chaos Lab"
  ];

  return families.map((family, index) => ({
    time: formatClock(30 + index * 105),
    case: generateScenarioCase({
      family,
      difficulty: difficulties[index],
      randomness: randomness[index],
      trainingMode: index >= 2 ? "Blind Investigation" : "Guided",
      seed: `${seed}:queue:${index}`,
      caseNumber: index + 1
    })
  }));
}

export function gradeEvidenceSelection(caseFile: ScenarioCase, selectedEventIds: string[]): CaseDebrief {
  const selected = new Set(selectedEventIds);
  const correctlyIdentified = caseFile.telemetry_events.filter((event) => event.is_key_evidence && selected.has(event.event_id));
  const missedClues = caseFile.telemetry_events.filter((event) => event.is_key_evidence && !selected.has(event.event_id));
  const falsePositives = caseFile.telemetry_events.filter((event) => !event.is_key_evidence && selected.has(event.event_id));
  const keyTotal = Math.max(1, caseFile.key_evidence_event_ids.length);
  const decoyTotal = Math.max(1, caseFile.decoy_event_ids.length);
  const accuracyScore = (correctlyIdentified.length / keyTotal) * 100;
  const penalty = (falsePositives.length / decoyTotal) * 28 + missedClues.length * 9;
  const analystScore = Math.max(0, Math.min(100, Math.round(accuracyScore - penalty + 8)));
  const outcomeLabel = analystScore >= 90
    ? "Excellent triage"
    : analystScore >= 75
      ? "Strong analyst finding"
      : analystScore >= 55
        ? "Needs another pass"
        : "Missed the case narrative";

  return {
    correctly_identified: correctlyIdentified,
    missed_clues: missedClues,
    false_positives: falsePositives,
    analyst_score: analystScore,
    outcome_label: outcomeLabel,
    severity_explanation: `Severity is ${caseFile.severity} because ${caseFile.scenario_family.toLowerCase()} evidence depends on sequence. You selected ${correctlyIdentified.length} of ${keyTotal} key clues and added ${falsePositives.length} decoy event${falsePositives.length === 1 ? "" : "s"}.`,
    prevention_guidance: [
      ...caseFile.prevention_lessons,
      falsePositives.length > 0 ? "Document why decoy events were excluded from the final incident narrative" : "Keep the finding focused on the correlated evidence chain"
    ]
  };
}
