import type {
  CaseDebrief,
  EvidenceEvent,
  ScenarioCase,
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  TrainingMode
} from "@/types/adversim";

type ScenarioEventPackage = {
  source: string;
  summary: string;
  plain_english: string;
  severity: EvidenceEvent["severity"];
  tags: string[];
  source_ref?: string;
  contextualize?: boolean;
};

type ScenarioPackage = {
  family: ScenarioFamily;
  titles: string[];
  missionBriefings: string[];
  operationalGuidance?: string[];
  targetUsers?: string[];
  targetHosts?: string[];
  defaultDifficulty?: ScenarioDifficulty;
  attackerProfiles: string[];
  expectedFindings: string[];
  recommendedResponse: string[];
  preventionLessons: string[];
  threatLogs: ScenarioEventPackage[];
  backgroundNoise: ScenarioEventPackage[];
};

export type ScenarioEventDefinition = ScenarioEventPackage;
export type ScenarioPackageDefinition = ScenarioPackage;

export const scenarioDifficulties: ScenarioDifficulty[] = ["Beginner", "Intermediate", "Expert"];
export const scenarioRandomnessLevels: ScenarioRandomness[] = ["Low", "Medium", "Chaos Lab"];
export const trainingModes: TrainingMode[] = ["Guided", "Blind Investigation"];

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

const sharedBackgroundNoise: ScenarioEventPackage[] = [
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

export const scenarioPackages: Record<ScenarioFamily, ScenarioPackage> = {
  "Credential Compromise": {
    family: "Credential Compromise",
    titles: ["Credential Compromise Chain", "Privileged Login Anomaly", "Authentication Pressure Case"],
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
    missionBriefings: [
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
    threatLogs: [
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
    backgroundNoise: [
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
  },
  "Shadow Persistence": {
    family: "Shadow Persistence",
    titles: ["Shadow Persistence", "RDP Persistence Review", "Service Account Session Drift"],
    missionBriefings: [
      "Detect and trace an unauthorized RDP session involving the svc-sql-sync service account on NYC-PROD-DB01.",
      "Service-account access, endpoint execution, outbound network telemetry, and group membership changes landed in the same window. Reconstruct the persistence path."
    ],
    targetUsers: ["svc-sql-sync"],
    targetHosts: ["NYC-PROD-DB01"],
    defaultDifficulty: "Intermediate",
    attackerProfiles: ["Synthetic persistence emulator", "Service-account misuse training persona", "Lab-only RDP persistence actor"],
    expectedFindings: [
      "RDP session succeeded for the service account",
      "Endpoint execution occurred after the remote session",
      "Outbound command-and-control style connection aligned with the affected host",
      "Privilege or persistence-related group membership changed"
    ],
    recommendedResponse: [
      "Disable or rotate the affected service-account credential through approved procedure",
      "Review RDP session origin and administrative access history",
      "Audit group membership changes and rollback unauthorized additions",
      "Preserve authentication, endpoint, identity, and network telemetry for the incident window"
    ],
    preventionLessons: [
      "Restrict service accounts from interactive logon",
      "Alert on RDP access by non-human identities",
      "Monitor privileged group membership changes"
    ],
    threatLogs: [
      {
        source: "Auth",
        summary: "RDP login succeeded from 10.0.42.15 for {user} on {host}",
        plain_english: "A service account successfully opened a remote desktop session, which is unusual for this identity type.",
        severity: "High",
        tags: ["identity", "rdp", "remote-admin", "lateral-movement"],
        source_ref: "MITRE T1021.001"
      },
      {
        source: "Endpoint",
        summary: "Encoded administrative shell telemetry observed after the RDP session on {host}",
        plain_english: "The host recorded suspicious shell-style activity after the remote login. This is represented as inert training telemetry only.",
        severity: "High",
        tags: ["endpoint", "execution", "script", "process"],
        source_ref: "MITRE T1059.001"
      },
      {
        source: "Network",
        summary: "Outbound connection from {host} to reserved lab IP 203.0.113.88 matched command-channel style telemetry",
        plain_english: "The host contacted an external IP after suspicious endpoint activity, increasing incident confidence.",
        severity: "Critical",
        tags: ["network", "egress", "c2", "exfiltration"],
        source_ref: "MITRE T1071"
      },
      {
        source: "Identity",
        summary: "Privileged group membership modification recorded for {user}",
        plain_english: "The account's permissions changed during the suspicious session window.",
        severity: "Critical",
        tags: ["identity", "privilege", "persistence"],
        source_ref: "MITRE T1098"
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "adm-jlawson completed an approved admin login from a managed workstation",
        plain_english: "This is a normal administrator login and does not support the service-account persistence narrative.",
        severity: "Low",
        tags: ["decoy", "identity", "admin"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Windows Update service started on NYC-PROD-DB01 during the same maintenance window",
        plain_english: "The update service start is expected maintenance activity, not suspicious execution evidence.",
        severity: "Low",
        tags: ["decoy", "patch", "endpoint"],
        contextualize: false
      },
      {
        source: "DNS",
        summary: "Routine DNS queries to Microsoft update domains resolved successfully",
        plain_english: "This is normal operating-system background traffic.",
        severity: "Low",
        tags: ["decoy", "dns", "baseline"],
        contextualize: false
      }
    ]
  },
  "API Breach: Exfil Pulse": {
    family: "API Breach: Exfil Pulse",
    titles: ["API Breach: Exfil Pulse", "Authorization Bypass Exfil Review", "API Data Stream Investigation"],
    missionBriefings: [
      "Investigate 403 authorization bypasses on NYC-WEB-PROD-04 leading to a high-volume outbound data stream.",
      "API authorization failures, service identity activity, backup discovery, and outbound transfer telemetry indicate a possible application-layer data exposure."
    ],
    targetUsers: ["web-api-service"],
    targetHosts: ["NYC-WEB-PROD-04"],
    defaultDifficulty: "Expert",
    attackerProfiles: ["Synthetic API exfiltration emulator", "Application-layer data exposure persona", "Lab-only authorization abuse actor"],
    expectedFindings: [
      "API key exhaustion clustered around an internal users endpoint",
      "Service identity access appeared from an unusual source",
      "Discovery touched database backup paths",
      "Large outbound transfer followed the discovery sequence"
    ],
    recommendedResponse: [
      "Rotate affected API keys and review token scope",
      "Inspect API gateway, cloud identity, endpoint, and network telemetry together",
      "Restrict access to backup directories and validate retention policy",
      "Review outbound destination controls and preserve packet metadata"
    ],
    preventionLessons: [
      "Alert on authorization error bursts against sensitive API routes",
      "Apply least-privilege service tokens",
      "Monitor backup directory access and outbound transfer baselines"
    ],
    threatLogs: [
      {
        source: "Auth",
        summary: "Failed API key exhaustion observed on /v1/internal/users for {user}",
        plain_english: "A service identity generated repeated authorization failures against a sensitive internal API route.",
        severity: "High",
        tags: ["api", "identity", "credential-access"],
        source_ref: "OWASP API authorization telemetry"
      },
      {
        source: "Cloud",
        summary: "Unusual source sign-in recorded for {user} before the API error burst",
        plain_english: "The API service identity appeared from a source that does not match its normal baseline.",
        severity: "High",
        tags: ["cloud", "identity", "initial-access"],
        source_ref: "MITRE T1078"
      },
      {
        source: "Endpoint",
        summary: "Discovery sweep of /var/www/db_backups/ observed on {host}",
        plain_english: "The host touched database backup paths after suspicious API activity.",
        severity: "Critical",
        tags: ["endpoint", "discovery", "collection", "api"],
        source_ref: "MITRE T1083"
      },
      {
        source: "Network",
        summary: "1.2GB outbound data transfer from {host} to reserved lab IP 203.0.113.109 exceeded baseline",
        plain_english: "A large outbound transfer occurred after sensitive-path discovery.",
        severity: "Critical",
        tags: ["network", "egress", "exfiltration", "api"],
        source_ref: "MITRE T1041"
      }
    ],
    backgroundNoise: [
      {
        source: "API Gateway",
        summary: "Health check heartbeat completed for /healthz on NYC-WEB-PROD-04",
        plain_english: "This is expected availability monitoring and does not support the breach narrative.",
        severity: "Low",
        tags: ["decoy", "monitoring", "api"],
        contextualize: false
      },
      {
        source: "Identity",
        summary: "Routine token refresh completed for web-api-service through the approved identity provider",
        plain_english: "This is normal token lifecycle activity.",
        severity: "Low",
        tags: ["decoy", "identity", "token"],
        contextualize: false
      },
      {
        source: "Application",
        summary: "Log rotation event compressed yesterday's API logs on NYC-WEB-PROD-04",
        plain_english: "This is expected operations hygiene and is not suspicious by itself.",
        severity: "Low",
        tags: ["decoy", "logging", "application"],
        contextualize: false
      }
    ]
  },
  "Ransomware Stage: Alpha": {
    family: "Ransomware Stage: Alpha",
    titles: ["Ransomware Stage: Alpha", "Encryption Canary Review", "File Server Lockout Precursor"],
    missionBriefings: [
      "Identify early-stage file encryption canary tests on the NYC-FS-02 file server before a full-scale lockout.",
      "File-server telemetry shows discovery, privilege request, canary rename activity, and attempted movement toward backups. Determine which clues indicate pre-impact staging."
    ],
    targetUsers: ["local-admin-svc"],
    targetHosts: ["NYC-FS-02"],
    defaultDifficulty: "Expert",
    attackerProfiles: ["Synthetic ransomware staging emulator", "Pre-impact lockout training persona", "Lab-only file encryption actor"],
    expectedFindings: [
      "High-frequency directory listing occurred in archival shares",
      "Backup-related privilege request appeared for a local admin service account",
      "Canary file rename pattern indicated encryption testing",
      "Lateral connection attempt reached toward the backup node"
    ],
    recommendedResponse: [
      "Isolate the affected file server according to response procedure",
      "Validate backup integrity and restrict backup-node access",
      "Review privilege use and disable unnecessary service-account access",
      "Preserve file rename, endpoint, authentication, and lateral-connection telemetry"
    ],
    preventionLessons: [
      "Alert on file rename bursts and canary extension changes",
      "Restrict backup privileges to approved maintenance windows",
      "Monitor lateral movement attempts toward backup infrastructure"
    ],
    threatLogs: [
      {
        source: "Endpoint",
        summary: "High-frequency directory listing in archival shares observed on {host}",
        plain_english: "The file server was rapidly enumerating archive folders, which can precede collection or impact behavior.",
        severity: "High",
        tags: ["endpoint", "discovery", "fileshare"],
        source_ref: "MITRE T1083"
      },
      {
        source: "Auth",
        summary: "{user} requested SeBackupPrivilege on {host}",
        plain_english: "A service account requested backup-level privilege during the suspicious window.",
        severity: "Critical",
        tags: ["identity", "privilege", "backup"],
        source_ref: "MITRE T1490"
      },
      {
        source: "Endpoint",
        summary: "Canary encryption test renamed 500+ files to .crypt on {host}",
        plain_english: "A high-volume file rename pattern resembles early impact staging in this synthetic training case.",
        severity: "Critical",
        tags: ["endpoint", "execution", "ransomware", "encryption-test", "impact-prevention"],
        source_ref: "MITRE T1486"
      },
      {
        source: "Network",
        summary: "Attempted lateral connection from {host} to internal backup node NYC-BKP-01",
        plain_english: "The affected file server attempted to reach backup infrastructure during the suspicious sequence.",
        severity: "High",
        tags: ["network", "lateral-movement", "backup", "east-west"],
        source_ref: "MITRE T1021"
      }
    ],
    backgroundNoise: [
      {
        source: "Search",
        summary: "Search indexing catalog refresh scanned user home directories on NYC-FS-02",
        plain_english: "Indexing activity is normal file-server background behavior and should not be selected.",
        severity: "Low",
        tags: ["decoy", "indexing", "fileshare"],
        contextualize: false
      },
      {
        source: "NTP",
        summary: "NTP time synchronization completed successfully for NYC-FS-02",
        plain_english: "Time synchronization is normal infrastructure activity.",
        severity: "Low",
        tags: ["decoy", "ntp", "baseline"],
        contextualize: false
      },
      {
        source: "Auth",
        summary: "Routine user login completed from a managed workstation during business hours",
        plain_english: "This is ordinary user access and does not support the ransomware staging narrative.",
        severity: "Low",
        tags: ["decoy", "identity", "baseline"],
        contextualize: false
      }
    ]
  },
  "Insider Leak: Departure": {
    family: "Insider Leak: Departure",
    titles: ["Insider Threat: The Departure", "Departure Data Review", "High-Privilege Exit Investigation"],
    missionBriefings: [
      "A senior engineer has submitted their resignation. Shortly after, the Data Loss Prevention system flagged an unusual volume of archive files being moved to a personal cloud storage mount. The user claims they are just cleaning up personal files, but the file names suggest proprietary project data. Determine whether this is standard cleanup or coordinated data theft.",
      "Monitor a high-privilege user's activity following a formal resignation notice. Separate routine offboarding activity from archive creation, DLP interference, and outbound transfer telemetry."
    ],
    operationalGuidance: [
      "This is a behavioral hunt. Look for creation of .zip or .7z archives followed by outbound web traffic to non-corporate cloud domains. Check whether the user is bypassing standard VPN expectations."
    ],
    targetUsers: ["j-vazquez"],
    targetHosts: ["NYC-HQ-WKST-22"],
    defaultDifficulty: "Intermediate",
    attackerProfiles: ["Synthetic insider-risk persona", "Departure data-handling emulator", "Lab-only offboarding risk actor"],
    expectedFindings: [
      "Large archive was created on the endpoint after the resignation trigger",
      "DLP service disablement was attempted by the target user",
      "Outbound transfer to personal cloud storage followed archive creation",
      "Automated lockout happened after the suspicious sequence"
    ],
    recommendedResponse: [
      "Preserve DLP, endpoint, network, and identity telemetry for the offboarding window",
      "Review approved data-retention and personal-file cleanup exceptions",
      "Validate whether the archive contains proprietary project data",
      "Coordinate account lockout review with HR, legal, and security leadership"
    ],
    preventionLessons: [
      "Monitor archive creation by high-privilege users during offboarding",
      "Alert on DLP service tampering attempts",
      "Inspect large transfers to personal cloud destinations"
    ],
    threatLogs: [
      {
        source: "Endpoint",
        summary: "7zip.exe created Project_Zephyr_Complete.7z, 4.2GB, on {host}",
        plain_english: "The target user created a large archive whose name suggests proprietary project data.",
        severity: "Medium",
        tags: ["endpoint", "collection", "staging", "fileshare"],
        source_ref: "MITRE T1560"
      },
      {
        source: "Auth",
        summary: "{user} attempted to disable the DLP agent service",
        plain_english: "The user tried to interfere with a monitoring control during the suspicious window.",
        severity: "High",
        tags: ["identity", "privilege", "dlp", "defense-control"],
        source_ref: "MITRE T1078.003"
      },
      {
        source: "Network",
        summary: "Outbound pulse: 4GB transfer from {host} to personal cloud storage over HTTPS",
        plain_english: "A large outbound transfer followed archive creation and DLP tampering.",
        severity: "Critical",
        tags: ["network", "egress", "exfiltration", "cloud-transfer"],
        source_ref: "MITRE T1537"
      },
      {
        source: "Identity",
        summary: "Automated system lockout triggered for account {user}",
        plain_english: "Automated controls responded after the risky sequence reached policy threshold.",
        severity: "Low",
        tags: ["identity", "response", "policy"],
        source_ref: "Defensive control telemetry"
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "s-choi successful login to NYC-HQ-WKST-15",
        plain_english: "Another user's normal workstation login is unrelated to the target user's behavior.",
        severity: "Low",
        tags: ["decoy", "identity", "baseline"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Chrome downloaded Resignation_Policy.pdf",
        plain_english: "Policy-document access is expected offboarding background activity.",
        severity: "Low",
        tags: ["decoy", "browser", "offboarding"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "200MB video stream detected from NYC-HQ-WKST-22",
        plain_english: "Streaming traffic is background noise and does not prove data theft.",
        severity: "Low",
        tags: ["decoy", "network", "baseline"],
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "Corporate OneDrive sync completed successfully",
        plain_english: "Approved corporate storage sync is not the same as the personal cloud transfer.",
        severity: "Low",
        tags: ["decoy", "cloud", "storage"],
        contextualize: false
      },
      {
        source: "Auth",
        summary: "Document Exit_Interview_Form.docx sent to Printer-SOC-01",
        plain_english: "Printing an exit form is normal offboarding activity.",
        severity: "Low",
        tags: ["decoy", "printer", "offboarding"],
        contextualize: false
      }
    ]
  },
  "Zero-Day: Log-Pulse RCE": {
    family: "Zero-Day: Log-Pulse RCE",
    titles: ["Zero-Day: Log-Pulse RCE", "Log Management RCE Attempt", "Log-Pulse Shell Investigation"],
    missionBriefings: [
      "We've detected a series of malformed JNDI-style lookups in web server logs. Within seconds of these hits, a new listener was established on the logging server. It appears an adversary is exploiting a synthetic logging-framework weakness to spawn an administrative shell pattern. Find the shell process and stop the connection before activity pivots toward the domain controller.",
      "Neutralize a Remote Code Execution attempt hitting the log management server. Correlate malformed inbound web telemetry, shell-like process activity, discovery, and local-console access."
    ],
    operationalGuidance: [
      "RCE moves fast. Correlate the admin shell signal with the inbound pulse on the web interface. If a web service spawns shell-like process telemetry, treat the sequence as confirmed compromise in this synthetic lab."
    ],
    targetUsers: ["log-service-daemon"],
    targetHosts: ["CANTON-LOG-SVR-01"],
    defaultDifficulty: "Expert",
    attackerProfiles: ["Synthetic RCE response emulator", "Log-service exploitation training persona", "Lab-only public-service intrusion actor"],
    expectedFindings: [
      "Malformed inbound request pattern hit the logging interface",
      "Log service spawned sanitized shell-like process telemetry",
      "Discovery scan originated from the logging server",
      "Privileged local-console access appeared after shell activity"
    ],
    recommendedResponse: [
      "Isolate the log management server from outbound and east-west traffic",
      "Preserve web, process, and network telemetry for the affected window",
      "Rotate log-service credentials and review privileged local-console access",
      "Validate patch status and disable vulnerable logging exposure through approved change control"
    ],
    preventionLessons: [
      "Alert on web services spawning shell-like child processes",
      "Correlate malformed inbound strings with process and network telemetry",
      "Segment logging infrastructure from domain-controller pathways"
    ],
    threatLogs: [
      {
        source: "Network",
        summary: "Malformed JNDI-style lookup marker detected in HTTP header from reserved lab IP 198.51.100.42",
        plain_english: "The web-facing service received suspicious malformed input. The exact exploit syntax is intentionally omitted.",
        severity: "High",
        tags: ["network", "rce", "inbound", "api"],
        source_ref: "MITRE T1210"
      },
      {
        source: "Endpoint",
        summary: "{user} spawned sanitized shell-like telemetry on {host}; command content redacted for safety",
        plain_english: "A web or log service launching shell-like activity is a high-confidence compromise signal.",
        severity: "Critical",
        tags: ["endpoint", "execution", "script", "unix-shell", "process"],
        source_ref: "MITRE T1059.004"
      },
      {
        source: "Discovery",
        summary: "Discovery sweep: internal subnet scan initiated from {host}",
        plain_english: "The affected server began looking across the internal network after the shell signal.",
        severity: "High",
        tags: ["discovery", "network", "lateral-movement"],
        source_ref: "MITRE T1046"
      },
      {
        source: "Auth",
        summary: "New source sign-in: root access from {host} local console",
        plain_english: "Privileged local access appeared after the suspicious process activity.",
        severity: "Critical",
        tags: ["identity", "initial-access", "privilege", "local-account"],
        source_ref: "MITRE T1078.003"
      }
    ],
    backgroundNoise: [
      {
        source: "Endpoint",
        summary: "syslog-ng rotated internal message buffers",
        plain_english: "Log rotation is routine maintenance and not a compromise clue.",
        severity: "Low",
        tags: ["decoy", "logging", "endpoint"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "ICMP echo request to 10.0.0.1 gateway successful",
        plain_english: "A gateway heartbeat is normal infrastructure noise.",
        severity: "Low",
        tags: ["decoy", "heartbeat", "network"],
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "CloudWatch ingested 450 new events from log-service",
        plain_english: "Cloud log ingestion is expected monitoring behavior.",
        severity: "Low",
        tags: ["decoy", "cloud", "logging"],
        contextualize: false
      },
      {
        source: "Identity",
        summary: "Validated JWT for admin console access",
        plain_english: "A valid token check alone does not prove the RCE path.",
        severity: "Low",
        tags: ["decoy", "identity", "token"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "/tmp directory scrubbed by daily cron job",
        plain_english: "Scheduled cleanup is normal host maintenance.",
        severity: "Low",
        tags: ["decoy", "cron", "endpoint"],
        contextualize: false
      }
    ]
  },
  "Supply Chain: Poisoned Update": {
    family: "Supply Chain: Poisoned Update",
    titles: ["Supply Chain: Poisoned Update", "Trusted Update Anomaly", "Financial App Update Investigation"],
    missionBriefings: [
      "Our financial reporting app recently updated to v4.2.1. While the digital signature is valid, the app has started making connections to a dynamic DNS address in a region the organization does not normally use. This resembles a poisoned update where a vendor build pipeline may have been compromised. Identify how the software maintains persistence.",
      "Investigate an anomalous process originating from a trusted software update. Focus on whether signed software activity diverges from expected update behavior."
    ],
    operationalGuidance: [
      "Trust nothing. Focus on privilege attempts and discovery sweeps. Supply-chain attacks often hide in plain sight by using legitimate software names to mask malicious activity."
    ],
    targetUsers: ["SYSTEM"],
    targetHosts: ["NYC-FIN-APP-09"],
    defaultDifficulty: "Expert",
    attackerProfiles: ["Synthetic supply-chain risk emulator", "Trusted-update anomaly persona", "Lab-only poisoned update actor"],
    expectedFindings: [
      "Trusted updater executed with high privilege",
      "Registry run key was modified for persistence",
      "Financial documents were enumerated after the update",
      "Encrypted outbound transfer followed discovery"
    ],
    recommendedResponse: [
      "Quarantine the affected application host according to procedure",
      "Preserve updater binary metadata, registry telemetry, and network logs",
      "Review vendor update provenance and suspend the update channel if authorized",
      "Audit financial data access and validate whether sensitive files left the environment"
    ],
    preventionLessons: [
      "Monitor signed software for unusual persistence changes",
      "Alert on trusted apps accessing unexpected data paths",
      "Validate vendor-update behavior against network baselines"
    ],
    threatLogs: [
      {
        source: "Endpoint",
        summary: "FinReporter_Update.exe executed with SYSTEM privileges on {host}",
        plain_english: "A trusted updater ran with high privilege. By itself this can be normal, but the later sequence makes it relevant.",
        severity: "Low",
        tags: ["endpoint", "supply-chain", "package", "execution"],
        source_ref: "MITRE T1195.002"
      },
      {
        source: "Identity",
        summary: "FinReporter.exe modified HKLM Run key persistence configuration on {host}",
        plain_english: "The application created or changed an auto-start location used for persistence.",
        severity: "High",
        tags: ["identity", "privilege", "persistence", "registry"],
        source_ref: "MITRE T1547.001"
      },
      {
        source: "Discovery",
        summary: "Discovery sweep: search for *.xlsx and *.pdf in D:\\Financial_Data\\ on {host}",
        plain_english: "The process searched financial documents after the trusted update ran.",
        severity: "Medium",
        tags: ["discovery", "fileshare", "collection", "supply-chain"],
        source_ref: "MITRE T1083"
      },
      {
        source: "Network",
        summary: "Outbound pulse: 800MB encrypted transfer from {host} to update-srv-cdn3.test",
        plain_english: "An encrypted outbound transfer followed financial data discovery. The destination is synthetic lab-only telemetry.",
        severity: "Critical",
        tags: ["network", "egress", "exfiltration", "supply-chain"],
        source_ref: "MITRE T1041"
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "MSSQLServer service started successfully",
        plain_english: "A normal database service start is not evidence of poisoned update behavior.",
        severity: "Low",
        tags: ["decoy", "service", "database"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "Clock synchronized with time.windows.com",
        plain_english: "Time synchronization is routine host activity.",
        severity: "Low",
        tags: ["decoy", "ntp", "baseline"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Windows Defender scheduled scan completed with no detections",
        plain_english: "A clean scheduled scan is background context, not a supply-chain clue.",
        severity: "Low",
        tags: ["decoy", "av", "endpoint"],
        contextualize: false
      },
      {
        source: "Identity",
        summary: "Kerberos TGS request for CIFS/NYC-FILE-SVR",
        plain_english: "Routine Kerberos ticket activity is not part of the updater sequence.",
        severity: "Low",
        tags: ["decoy", "identity", "kerberos"],
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "Automated cloud backup of database logs initiated",
        plain_english: "Approved backup activity should not be confused with unexpected outbound transfer.",
        severity: "Low",
        tags: ["decoy", "backup", "cloud"],
        contextualize: false
      }
    ]
  },
  "Identity: Session Hijack": {
    family: "Identity: Session Hijack",
    titles: ["Identity: Session Hijack", "Cloud Admin Session Review", "Cookie Replay Investigation"],
    missionBriefings: [
      "Our identity provider flagged a successful cloud console login for a senior administrator from a region outside standard operations. MFA was active, but no challenge was issued, suggesting potential session-cookie theft. Identify the source of the cookie exfiltration and determine which administrative actions occurred post-hijack.",
      "Trace a session hijacking event targeting a high-privilege cloud administrator account. Correlate browser data access, MFA bypass telemetry, policy modification, and outbound management traffic."
    ],
    operationalGuidance: [
      "Correlate the browser signal with the MFA bypass event. Look for browser-based credential-store access on the management gateway shortly before the anomalous login."
    ],
    targetUsers: ["cloud-admin-01"],
    targetHosts: ["NYC-MGMT-GW"],
    defaultDifficulty: "Intermediate",
    attackerProfiles: ["Synthetic cloud session hijack emulator", "Cloud-admin misuse training persona", "Lab-only cookie replay actor"],
    expectedFindings: [
      "Browser-related process accessed local credential-store telemetry",
      "Cloud session was established through an existing token without MFA challenge",
      "Conditional Access policy was modified by the administrator identity",
      "Management traffic reached a non-standard cloud endpoint"
    ],
    recommendedResponse: [
      "Revoke active sessions and rotate credentials for the affected cloud administrator",
      "Review Conditional Access policy changes and restore authorized baseline",
      "Inspect browser and endpoint telemetry on the management gateway",
      "Preserve identity-provider, endpoint, cloud audit, and network logs"
    ],
    preventionLessons: [
      "Alert on MFA-skipped sessions for privileged accounts",
      "Monitor browser credential-store access on admin workstations",
      "Require reauthentication for sensitive policy changes"
    ],
    threatLogs: [
      {
        source: "Endpoint",
        summary: "Browser-related process accessed local credential-store telemetry on {host}; content sanitized",
        plain_english: "The management gateway recorded browser data access shortly before the unusual cloud session.",
        severity: "High",
        tags: ["endpoint", "credential-access", "browser-data", "collection"],
        source_ref: "MITRE T1539"
      },
      {
        source: "Auth",
        summary: "Cloud session established for {user} via existing session token; no MFA challenge required",
        plain_english: "A privileged cloud session opened without the expected MFA prompt because an existing session artifact was used.",
        severity: "Critical",
        tags: ["identity", "cloud", "session-hijack", "credential-access"],
        source_ref: "MITRE T1550.004"
      },
      {
        source: "Cloud",
        summary: "Conditional Access policy Global_MFA_Enforce modified by {user}",
        plain_english: "A privileged identity changed MFA enforcement policy after the suspicious session began.",
        severity: "Critical",
        tags: ["cloud", "privilege", "defense-control", "policy-change"],
        source_ref: "MITRE T1562.001"
      },
      {
        source: "Network",
        summary: "Management traffic pulse from {host} to non-standard cloud endpoint; destination redacted",
        plain_english: "The management gateway communicated with an unusual cloud endpoint during the suspicious session window.",
        severity: "Medium",
        tags: ["network", "egress", "cloud", "c2"],
        source_ref: "MITRE T1071.001"
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "adm-skeller successful login to NYC-OFFICE-04",
        plain_english: "This is a normal administrator login on a different workstation.",
        severity: "Low",
        tags: ["decoy", "identity", "baseline"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Microsoft Edge successfully updated to latest version",
        plain_english: "Browser auto-update activity is expected endpoint maintenance.",
        severity: "Low",
        tags: ["decoy", "browser", "patch"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "VPN gateway health check successful",
        plain_english: "Gateway heartbeat telemetry is normal infrastructure noise.",
        severity: "Low",
        tags: ["decoy", "heartbeat", "network"],
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "Automated tag assignment completed for 50 production instances",
        plain_english: "Automated resource tagging is unrelated cloud operations activity.",
        severity: "Low",
        tags: ["decoy", "cloud", "automation"],
        contextualize: false
      }
    ]
  },
  "Stealth: Resource Exhaustion": {
    family: "Stealth: Resource Exhaustion",
    titles: ["Stealth: Resource Exhaustion", "Cryptojacking Resource Review", "Development Server CPU Pulse"],
    missionBriefings: [
      "Performance monitors on a Linux development node show sustained 90 percent CPU utilization during off-hours. No scheduled build jobs were active. Initial inspection suggests a hidden process is consuming resources and communicating with a resource pool. Find the persistence mechanism and source of the initial script execution.",
      "Identify unauthorized resource hijacking behavior running on a development server. Correlate CPU telemetry, scheduled persistence, and outbound pool-sync traffic."
    ],
    operationalGuidance: [
      "Look for the CPU pulse in telemetry and correlate it with outbound activity on non-standard ports. Check for unusual cron jobs or systemd-style persistence signals."
    ],
    targetUsers: ["dev-user-05"],
    targetHosts: ["CANTON-DEV-LNX-03"],
    defaultDifficulty: "Beginner",
    attackerProfiles: ["Synthetic resource-hijacking emulator", "Development-server abuse training persona", "Lab-only cryptomining pattern actor"],
    expectedFindings: [
      "CPU utilization exceeded the development-server baseline for hours",
      "New scheduled task persisted under the developer account",
      "Outbound pool-sync traffic appeared on a non-standard port"
    ],
    recommendedResponse: [
      "Terminate the unauthorized process through approved endpoint response procedures",
      "Remove unauthorized scheduled-task persistence",
      "Review shell history and deployment telemetry for the affected user",
      "Block non-standard pool-sync destination traffic"
    ],
    preventionLessons: [
      "Alert on sustained off-hours CPU spikes",
      "Monitor new cron entries for developer accounts",
      "Baseline outbound traffic from development servers"
    ],
    threatLogs: [
      {
        source: "Endpoint",
        summary: "CPU utilization exceeded 90 percent for 4+ hours on {host}; process content sanitized",
        plain_english: "The development node consumed far more compute than expected while no build job was active.",
        severity: "Medium",
        tags: ["endpoint", "resource-hijacking", "execution"],
        source_ref: "MITRE T1496"
      },
      {
        source: "Endpoint",
        summary: "New crontab entry added for {user}: daily script execution metadata only",
        plain_english: "A new scheduled task created persistence for recurring execution.",
        severity: "High",
        tags: ["endpoint", "scheduled-task", "persistence", "execution"],
        source_ref: "MITRE T1053.003"
      },
      {
        source: "Network",
        summary: "Persistent connection from {host} to remote resource pool on port 14444",
        plain_english: "The host maintained a non-standard outbound connection associated with resource pool synchronization.",
        severity: "High",
        tags: ["network", "egress", "resource-hijacking", "c2"],
        source_ref: "MITRE T1071.001"
      }
    ],
    backgroundNoise: [
      {
        source: "Endpoint",
        summary: "logrotate.service completed for system logs",
        plain_english: "Log rotation is normal Linux maintenance.",
        severity: "Low",
        tags: ["decoy", "logging", "endpoint"],
        contextualize: false
      },
      {
        source: "Auth",
        summary: "dev-lead-01 successful SSH login to CANTON-DEV-LNX-01",
        plain_english: "Another developer logged into a different host and is not part of this case.",
        severity: "Low",
        tags: ["decoy", "identity", "ssh"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "DNS query for github.com completed successfully",
        plain_english: "Developer tooling commonly reaches GitHub and this query is not suspicious by itself.",
        severity: "Low",
        tags: ["decoy", "dns", "developer"],
        contextualize: false
      }
    ]
  },
  "Recon: Password Spraying": {
    family: "Recon: Password Spraying",
    titles: ["Recon: Password Spraying", "VPN Auth Spray Review", "Password Spray Pulse"],
    missionBriefings: [
      "Security logs for the VPN gateway show a high volume of authentication failures across hundreds of unique usernames within a short window. Each username is targeted only once or twice, suggesting an attempt to bypass traditional lockout policies. Identify the spray source and confirm whether any accounts were compromised.",
      "Detect a broad-scale password spraying attempt targeting the corporate VPN gateway. Correlate failure volume, unusual success, and VPN session establishment."
    ],
    operationalGuidance: [
      "This is a pattern-matching task. Look for the auth fail pulse across identity logs. A single auth success following a long string of failures from the same source is the key evidence."
    ],
    targetUsers: ["multiple.users", "v-jackson"],
    targetHosts: ["NYC-VPN-GATEWAY"],
    defaultDifficulty: "Intermediate",
    attackerProfiles: ["Synthetic password-spray emulator", "VPN authentication training persona", "Lab-only credential pressure actor"],
    expectedFindings: [
      "Large failure burst targeted many unique usernames from one source",
      "One account succeeded after the spray pattern",
      "VPN session started for the successful account from the same suspicious source"
    ],
    recommendedResponse: [
      "Disable or reset the successfully accessed account according to procedure",
      "Review VPN source IP reputation and block according to policy",
      "Search for additional successful sessions from the same source",
      "Tune identity detection for low-and-wide password spraying"
    ],
    preventionLessons: [
      "Alert on distributed username failure patterns",
      "Require MFA for VPN access",
      "Monitor single successes after broad failure bursts"
    ],
    threatLogs: [
      {
        source: "Auth",
        summary: "250+ failed VPN login attempts across unique usernames from a single source",
        plain_english: "Many accounts failed only once or twice from the same source, which fits password spraying.",
        severity: "High",
        tags: ["identity", "credential-access", "password-spray"],
        source_ref: "MITRE T1110.003",
        contextualize: false
      },
      {
        source: "Auth",
        summary: "Successful login for account v-jackson after 50+ failures from the spray source",
        plain_english: "One account successfully authenticated after the broad failure pattern.",
        severity: "Critical",
        tags: ["identity", "credential-access", "initial-access", "password-spray"],
        source_ref: "MITRE T1110.003",
        contextualize: false
      },
      {
        source: "Network",
        summary: "New VPN session established for v-jackson from the spray source",
        plain_english: "The successful login produced an active VPN session from the suspicious source.",
        severity: "High",
        tags: ["network", "vpn", "initial-access", "remote-access"],
        source_ref: "MITRE T1133",
        contextualize: false
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "s-mitchell successful VPN login from known domestic IP",
        plain_english: "This known-source VPN login is normal baseline activity.",
        severity: "Low",
        tags: ["decoy", "identity", "vpn"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "Time sync successful with NYC-DC-01",
        plain_english: "Domain time synchronization is normal infrastructure behavior.",
        severity: "Low",
        tags: ["decoy", "ntp", "baseline"],
        contextualize: false
      },
      {
        source: "Identity",
        summary: "User k-lee successfully updated expired password",
        plain_english: "An approved password change is not part of the spray source pattern.",
        severity: "Low",
        tags: ["decoy", "identity", "password-change"],
        contextualize: false
      }
    ]
  },
  "BEC: Financial Diversion": {
    family: "BEC: Financial Diversion",
    titles: ["BEC: Financial Diversion", "Wire Transfer Mailbox Review", "Finance Mail Rule Investigation"],
    missionBriefings: [
      "The finance department reported an urgent email from the CFO requesting an immediate change to a vendor's banking details. The message appeared legitimate, but the link directed the user to a look-alike login portal. Confirm whether credentials were harvested and whether unauthorized mailbox rules were established to hide follow-up messages.",
      "Trace a Business Email Compromise attempt involving a fraudulent wire transfer request. Correlate inbound mail, unusual authentication, and mailbox rule creation."
    ],
    operationalGuidance: [
      "Correlate the inbound mail signal with unusual auth success from a new location. Check identity and mail logs for forwarding or deletion rules created immediately after login."
    ],
    targetUsers: ["f-miller"],
    targetHosts: ["NYC-FIN-WKST-05"],
    defaultDifficulty: "Intermediate",
    attackerProfiles: ["Synthetic BEC training persona", "Financial diversion emulator", "Lab-only mailbox fraud actor"],
    expectedFindings: [
      "Spearphishing link reached the finance user",
      "The target account authenticated from an unusual lab source",
      "Mailbox rule was created to hide wire-transfer related messages"
    ],
    recommendedResponse: [
      "Reset the affected account and revoke active mail sessions",
      "Remove unauthorized mailbox rules and preserve mail audit logs",
      "Validate vendor banking changes through an out-of-band business process",
      "Search for related messages sent to finance distribution lists"
    ],
    preventionLessons: [
      "Alert on suspicious links sent to finance users",
      "Monitor mailbox rule creation after unusual authentication",
      "Require out-of-band verification for banking detail changes"
    ],
    threatLogs: [
      {
        source: "Network",
        summary: "Spearphishing link detected in email from cfo@corp-office.test",
        plain_english: "The finance user received a message that looked executive-driven but pointed to a look-alike login flow.",
        severity: "Medium",
        tags: ["email", "phishing", "bec", "credential-access"],
        source_ref: "MITRE T1566.002",
        contextualize: false
      },
      {
        source: "Auth",
        summary: "Account f-miller authenticated from reserved lab IP 198.51.100.77 after the mail signal",
        plain_english: "The account successfully logged in from a source that does not match the normal finance workstation pattern.",
        severity: "High",
        tags: ["identity", "initial-access", "cloud", "bec"],
        source_ref: "MITRE T1078",
        contextualize: false
      },
      {
        source: "Identity",
        summary: "New mailbox rule created to delete messages containing Wire or Transfer",
        plain_english: "A mail rule was created to hide future financial-transfer messages from the user.",
        severity: "Critical",
        tags: ["mail", "mail-rule", "exfiltration", "post-login"],
        source_ref: "MITRE T1114.003",
        contextualize: false
      }
    ],
    backgroundNoise: [
      {
        source: "Auth",
        summary: "d-ross successful login to NYC-FIN-WKST-01",
        plain_english: "Another finance user's normal login is not part of this mailbox investigation.",
        severity: "Low",
        tags: ["decoy", "identity", "baseline"],
        contextualize: false
      },
      {
        source: "Network",
        summary: "DNS query for portal.office.com completed successfully",
        plain_english: "Routine productivity suite DNS resolution is expected business traffic.",
        severity: "Low",
        tags: ["decoy", "dns", "mail"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Document Q1_Report.pdf sent to Finance-Printer-01",
        plain_english: "A normal print job is unrelated to the suspicious mail rule sequence.",
        severity: "Low",
        tags: ["decoy", "printer", "finance"],
        contextualize: false
      }
    ]
  },
  "SQLi: Customer Data Harvest": {
    family: "SQLi: Customer Data Harvest",
    titles: ["SQLi: Customer Data Harvest", "Public Portal Data Harvest", "Blind SQLi Exposure Review"],
    missionBriefings: [
      "Web application firewalls flagged high-frequency HTTP POST requests to the /api/v2/search endpoint containing unusual character sequences. Database logs show a spike in reads from customer profile tables that do not match standard application queries. Identify the injection point and estimate the exposed data volume.",
      "Neutralize a blind SQL injection attack targeting the customer-facing web portal. Correlate malformed requests, database read spikes, and outbound transfer telemetry."
    ],
    operationalGuidance: [
      "Look for malformed request signals in network logs followed by database read pulses in cloud or backend telemetry. High-latency responses can indicate timing-test behavior in this synthetic case."
    ],
    targetUsers: ["web-portal-svc"],
    targetHosts: ["CANTON-WEB-PROD-02"],
    defaultDifficulty: "Expert",
    attackerProfiles: ["Synthetic web-app abuse emulator", "Public portal data-harvest persona", "Lab-only SQL injection training actor"],
    expectedFindings: [
      "Malformed POST parameter telemetry targeted the search endpoint",
      "Database read volume spiked against customer profile data",
      "Outbound HTTPS transfer followed the database read pulse"
    ],
    recommendedResponse: [
      "Enable containment for the affected web route according to procedure",
      "Preserve WAF, application, database, and network telemetry",
      "Review parameter handling and query patterns with the application owner",
      "Perform data exposure assessment for the affected customer records"
    ],
    preventionLessons: [
      "Alert on malformed request bursts against sensitive API routes",
      "Baseline database read volume per application endpoint",
      "Correlate WAF events with backend data-access spikes"
    ],
    threatLogs: [
      {
        source: "Network",
        summary: "SQL injection-style syntax detected in POST parameter query; payload sanitized for safety",
        plain_english: "The web portal received malformed input patterns associated with public application exploitation.",
        severity: "High",
        tags: ["network", "api", "sqli", "application"],
        source_ref: "MITRE T1190",
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "15,000+ records read from customer_profiles table in 60 seconds",
        plain_english: "The database read volume sharply exceeded normal application behavior.",
        severity: "Critical",
        tags: ["cloud", "db-read", "collection", "exfiltration"],
        source_ref: "MITRE T1530",
        contextualize: false
      },
      {
        source: "Network",
        summary: "Outbound HTTPS burst: 250MB from CANTON-WEB-PROD-02 to reserved lab IP 203.0.113.91",
        plain_english: "A large outbound transfer occurred after the suspicious database read spike.",
        severity: "Critical",
        tags: ["network", "egress", "exfiltration", "api"],
        source_ref: "MITRE T1041",
        contextualize: false
      }
    ],
    backgroundNoise: [
      {
        source: "Network",
        summary: "Load balancer health check successful for CANTON-WEB-PROD-02",
        plain_english: "Health checks are normal availability monitoring.",
        severity: "Low",
        tags: ["decoy", "monitoring", "network"],
        contextualize: false
      },
      {
        source: "Cloud",
        summary: "200 OK response for valid user login at /api/v2/login",
        plain_english: "A normal login response does not support the SQL injection narrative.",
        severity: "Low",
        tags: ["decoy", "api", "application"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Nginx access logs rotated successfully",
        plain_english: "Log rotation is expected web-server maintenance.",
        severity: "Low",
        tags: ["decoy", "logging", "endpoint"],
        contextualize: false
      }
    ]
  },
  "Shadow IT: Rogue Access Point": {
    family: "Shadow IT: Rogue Access Point",
    titles: ["Shadow IT: Rogue Access Point", "Rogue Wireless Investigation", "Guest VLAN Intercept Review"],
    missionBriefings: [
      "A security sweep identified a new wireless SSID named Corporate_Backup_WiFi that is not managed by IT. Several employee devices automatically connected to it. Telemetry suggests this Shadow IT device is intercepting traffic and performing basic protocol analysis. Isolate the device and identify which internal systems it attempted to probe.",
      "Locate a rogue wireless access point discovered on the corporate guest network. Correlate unauthorized device telemetry, network sniffing alerts, and internal discovery attempts."
    ],
    operationalGuidance: [
      "This is an ad-hoc discovery task. Focus on the unauthorized device signal and correlate it with network sniffing alerts from the internal gateway."
    ],
    targetUsers: ["guest-wifi-01"],
    targetHosts: ["NYC-HQ-AP-14"],
    defaultDifficulty: "Beginner",
    attackerProfiles: ["Synthetic rogue-access-point emulator", "Wireless inspection training persona", "Lab-only adversary-in-the-middle actor"],
    expectedFindings: [
      "Unauthorized wireless device appeared on the guest VLAN",
      "ARP poisoning or adversary-in-the-middle telemetry appeared on the subnet",
      "Rogue access point probed an internal file server"
    ],
    recommendedResponse: [
      "Physically locate and remove the unauthorized access point",
      "Rotate credentials for devices that connected to the rogue SSID",
      "Block the rogue MAC address and review guest VLAN segmentation",
      "Preserve WIDS, DHCP, gateway, and endpoint telemetry"
    ],
    preventionLessons: [
      "Continuously inventory wireless SSIDs and MAC addresses",
      "Alert on SSID impersonation and ARP poisoning",
      "Segment guest wireless traffic from internal services"
    ],
    threatLogs: [
      {
        source: "Network",
        summary: "New MAC address detected on Guest VLAN broadcasting managed-like SSID name",
        plain_english: "A wireless device appeared that is not part of the approved access point inventory.",
        severity: "Medium",
        tags: ["network", "rogue-ap", "wireless", "shadow-it"],
        source_ref: "MITRE T1584",
        contextualize: false
      },
      {
        source: "Network",
        summary: "ARP poisoning detected on subnet 192.168.50.0/24",
        plain_english: "The network saw behavior consistent with traffic interception on the guest subnet.",
        severity: "High",
        tags: ["network", "sniffing", "adversary-in-middle", "wireless"],
        source_ref: "MITRE T1557",
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Port scan detected from Rogue AP toward internal file server NYC-FS-01",
        plain_english: "The unauthorized device attempted to discover reachable internal services.",
        severity: "High",
        tags: ["endpoint", "discovery", "network", "rogue-ap"],
        source_ref: "MITRE T1046",
        contextualize: false
      }
    ],
    backgroundNoise: [
      {
        source: "Network",
        summary: "New guest user Guest_44 connected to Official_Guest_WiFi",
        plain_english: "A guest joining the approved SSID is normal guest-network behavior.",
        severity: "Low",
        tags: ["decoy", "wireless", "guest"],
        contextualize: false
      },
      {
        source: "Auth",
        summary: "IP 192.168.50.112 assigned to known corporate laptop",
        plain_english: "A normal DHCP assignment to a known device is not evidence of rogue access.",
        severity: "Low",
        tags: ["decoy", "dhcp", "network"],
        contextualize: false
      },
      {
        source: "Endpoint",
        summary: "Wireless intrusion detection service active",
        plain_english: "WIDS running is a normal defensive control, not the suspicious device itself.",
        severity: "Low",
        tags: ["decoy", "wireless", "defensive-control"],
        contextualize: false
      }
    ]
  }
};

export const scenarioFamilies = Object.keys(scenarioPackages) as ScenarioFamily[];

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

function formatEventSummary(event: ScenarioEventPackage, targetUser: string, targetHost: string) {
  if (event.contextualize === false) {
    return event.summary;
  }

  if (event.summary.includes("{user}") || event.summary.includes("{host}")) {
    return event.summary.replaceAll("{user}", targetUser).replaceAll("{host}", targetHost);
  }

  return `${event.summary} for ${targetUser}`;
}

function backgroundNoiseCount({
  difficulty,
  randomness,
  procedural,
  availableEvents
}: {
  difficulty: ScenarioDifficulty;
  randomness: ScenarioRandomness;
  procedural: boolean;
  availableEvents: number;
}) {
  const baseByDifficulty: Record<ScenarioDifficulty, number> = {
    Beginner: 2,
    Intermediate: 4,
    Expert: 6
  };
  const randomnessAdjustment: Record<ScenarioRandomness, number> = {
    Low: -1,
    Medium: 0,
    "Chaos Lab": 2
  };
  const proceduralAdjustment = procedural ? 0 : 1;
  const targetCount = baseByDifficulty[difficulty] + randomnessAdjustment[randomness] + proceduralAdjustment;

  return Math.max(1, Math.min(availableEvents, targetCount));
}

function sourceRefForEvent(family: ScenarioFamily, event: ScenarioEventPackage, isKeyEvidence: boolean) {
  if (event.source_ref) {
    return event.source_ref;
  }

  if (!isKeyEvidence) {
    return "AdverSim noise";
  }

  const tags = new Set(event.tags);

  if (tags.has("credential-access")) return "MITRE T1110";
  if (tags.has("rdp")) return "MITRE T1021.001";
  if (tags.has("initial-access")) return "MITRE T1078";
  if (tags.has("execution") || tags.has("script")) return "MITRE T1059";
  if (tags.has("rce")) return "MITRE T1210";
  if (tags.has("sqli")) return "MITRE T1190";
  if (tags.has("discovery")) return "MITRE T1083";
  if (tags.has("exfiltration") || tags.has("egress")) return "MITRE T1041";
  if (tags.has("c2")) return "MITRE T1071";
  if (tags.has("sharing") || tags.has("collection")) return "MITRE T1530";
  if (tags.has("cloud") || tags.has("post-login")) return "MITRE T1078";
  if (tags.has("remote-admin") || tags.has("east-west") || tags.has("lateral-movement")) return "MITRE T1021";
  if (tags.has("persistence")) return "MITRE T1098";
  if (tags.has("cloud-transfer")) return "MITRE T1537";
  if (tags.has("registry")) return "MITRE T1547.001";
  if (tags.has("mail-rule")) return "MITRE T1114.003";
  if (tags.has("sniffing")) return "MITRE T1040";
  if (tags.has("adversary-in-middle")) return "MITRE T1557";
  if (tags.has("rogue-ap")) return "MITRE T1584";
  if (family === "Ransomware Precursor" && tags.has("backup")) return "MITRE T1490";
  if (family === "Ransomware Stage: Alpha" && tags.has("backup")) return "MITRE T1490";
  if (family === "Ransomware Stage: Alpha") return "MITRE T1486";
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
    "Web API Exploitation": 3,
    "Shadow Persistence": 2,
    "API Breach: Exfil Pulse": 4,
    "Ransomware Stage: Alpha": 1,
    "Insider Leak: Departure": 4,
    "Zero-Day: Log-Pulse RCE": 1,
    "Supply Chain: Poisoned Update": 1,
    "Identity: Session Hijack": 0,
    "Stealth: Resource Exhaustion": 1,
    "Recon: Password Spraying": 0,
    "BEC: Financial Diversion": 0,
    "SQLi: Customer Data Harvest": 4,
    "Shadow IT: Rogue Access Point": 3
  };

  return indexByFamily[family];
}

function tacticIndexesForEvent(event: EvidenceEvent) {
  const tags = new Set(event.tags);
  const indexes = new Set<number>();

  if (tags.has("credential-access") || tags.has("identity") || tags.has("cloud") || tags.has("phishing") || tags.has("email") || tags.has("rdp") || tags.has("local-account") || tags.has("session-hijack") || tags.has("password-spray") || tags.has("vpn") || tags.has("remote-access") || tags.has("bec")) indexes.add(0);
  if (tags.has("execution") || tags.has("script") || tags.has("process") || tags.has("edr") || tags.has("staging") || tags.has("impact-prevention") || tags.has("ci") || tags.has("application") || tags.has("encryption-test") || tags.has("ransomware") || tags.has("rce") || tags.has("unix-shell") || tags.has("resource-hijacking") || tags.has("scheduled-task") || tags.has("sqli")) indexes.add(1);
  if (tags.has("privilege") || tags.has("privilege-review") || tags.has("remote-admin") || tags.has("repository") || tags.has("persistence") || tags.has("registry") || tags.has("defense-control") || tags.has("policy-change") || tags.has("adversary-in-middle")) indexes.add(2);
  if (tags.has("discovery") || tags.has("fileshare") || tags.has("collection") || tags.has("baseline") || tags.has("east-west") || tags.has("lateral-movement") || tags.has("correlation") || tags.has("file-change") || tags.has("api") || tags.has("supply-chain") || tags.has("rogue-ap") || tags.has("wireless") || tags.has("shadow-it")) indexes.add(3);
  if (tags.has("exfiltration") || tags.has("egress") || tags.has("sharing") || tags.has("network") || tags.has("dlp") || tags.has("saas") || tags.has("post-login") || tags.has("waf") || tags.has("c2") || tags.has("cloud-transfer") || tags.has("mail-rule") || tags.has("sniffing") || tags.has("db-read")) indexes.add(4);

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
  difficulty,
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
  const scenarioPackage = scenarioPackages[family];
  const resolvedDifficulty = difficulty ?? scenarioPackage.defaultDifficulty ?? "Beginner";
  const random = makeRandom(`${seed}:${family}:${resolvedDifficulty}:${randomness}:${trainingMode}:${caseNumber}`);
  const targetUser = pick(scenarioPackage.targetUsers ?? users, random);
  const targetHost = pick(scenarioPackage.targetHosts ?? hosts, random);
  const severity = severityForDifficulty(resolvedDifficulty, random);
  const confidence = confidenceForSeverity(severity, random);
  const backgroundPool = procedural || resolvedDifficulty !== "Beginner" || randomness === "Chaos Lab"
    ? [...scenarioPackage.backgroundNoise, ...sharedBackgroundNoise]
    : scenarioPackage.backgroundNoise;
  const noiseCount = backgroundNoiseCount({
    difficulty: resolvedDifficulty,
    randomness,
    procedural,
    availableEvents: backgroundPool.length
  });
  const threatLogCount = procedural
    ? Math.min(scenarioPackage.threatLogs.length, 3 + Math.floor(random() * 2))
    : scenarioPackage.threatLogs.length;
  const selectedThreatLogs = procedural
    ? shuffle(scenarioPackage.threatLogs, random).slice(0, threatLogCount)
    : scenarioPackage.threatLogs;
  const threatEvents = selectedThreatLogs.map((event, index) => ({ event, key: true, index }));
  const noiseEvents = shuffle(backgroundPool, random).slice(0, noiseCount).map((event, index) => ({ event, key: false, index }));
  const rawEvents = procedural || trainingMode === "Blind Investigation" || randomness === "Chaos Lab"
    ? shuffle([...threatEvents, ...noiseEvents], random)
    : [...threatEvents, ...noiseEvents];
  const timestamps = realtime ? realtimeTimestamps(rawEvents.length, random) : null;
  const caseId = `ADV-2026-${caseNumber.toString().padStart(3, "0")}`;

  const telemetryEvents = rawEvents.map(({ event, key }, index): EvidenceEvent => ({
    event_id: `evt-${(index + 1).toString().padStart(3, "0")}`,
    timestamp: timestamps?.[index] ?? formatClock(30 + index * (randomness === "Chaos Lab" ? 17 : 12)),
    source: event.source,
    summary: formatEventSummary(event, targetUser, targetHost),
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
    title: pick(scenarioPackage.titles, random),
    scenario_family: family,
    difficulty: resolvedDifficulty,
    severity,
    target_user: targetUser,
    target_host: targetHost,
    attacker_profile: pick(scenarioPackage.attackerProfiles, random),
    false_lead: falseLead,
    confidence,
    case_briefing: pick(scenarioPackage.missionBriefings, random),
    operational_guidance: pick(
      scenarioPackage.operationalGuidance ?? [
        "Filter high-fidelity signals from baseline background noise to reconstruct the attack timeline and identify the adversary's objective."
      ],
      random
    ),
    telemetry_events: telemetryEvents,
    key_evidence_event_ids: keyEvidenceIds,
    decoy_event_ids: decoyIds,
    expected_findings: scenarioPackage.expectedFindings,
    recommended_response: scenarioPackage.recommendedResponse,
    prevention_lessons: scenarioPackage.preventionLessons,
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
      difficulty: scenarioPackages[family].defaultDifficulty ?? difficulties[index % difficulties.length],
      randomness: randomness[index % randomness.length],
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
