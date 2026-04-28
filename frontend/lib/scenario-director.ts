import type {
  CaseDebrief,
  EvidenceEvent,
  ScenarioCase,
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  TrainingMode
} from "@/types/adversim";

type EventTemplate = {
  source: string;
  summary: string;
  plain_english: string;
  severity: EvidenceEvent["severity"];
  tags: string[];
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

export const scenarioFamilies: ScenarioFamily[] = [
  "Credential Compromise",
  "Insider Data Drift",
  "Cloud Account Takeover",
  "Endpoint Activity",
  "Exfiltration Signal"
];

export const scenarioDifficulties: ScenarioDifficulty[] = ["Beginner", "Intermediate", "SOC", "Analyst"];
export const scenarioRandomnessLevels: ScenarioRandomness[] = ["Low", "Medium", "Chaos Lab"];
export const trainingModes: TrainingMode[] = ["Guided", "Blind Investigation"];

const users = [
  "finance.admin",
  "lisa.chen@adversim.co",
  "morgan.ellis",
  "hr.manager",
  "project.contractor",
  "samir.patel"
];

const hosts = ["NYC-WKS-014", "NYC-WKS-015", "NYC-FIN-021", "SEA-LAP-008", "ATL-HR-044", "DAL-VDI-102"];

const templates: Record<ScenarioFamily, ScenarioTemplate> = {
  "Credential Compromise": {
    family: "Credential Compromise",
    titles: ["Credential Compromise Chain", "Privileged Login Anomaly", "Authentication Pressure Case"],
    briefings: [
      "A suspicious authentication pattern has been detected involving a privileged account. Decide whether this is normal behavior or a likely compromise chain.",
      "Several identity and endpoint signals landed close together. Your task is to separate meaningful clues from normal background activity."
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

function severityForDifficulty(difficulty: ScenarioDifficulty, random: () => number): ScenarioCase["severity"] {
  if (difficulty === "Beginner") {
    return pick(["Medium", "High"], random);
  }

  if (difficulty === "Intermediate") {
    return pick(["Medium", "High", "Critical"], random);
  }

  if (difficulty === "SOC") {
    return pick(["High", "Critical"], random);
  }

  return pick(["Low", "Medium", "High", "Critical"], random);
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

export function generateScenarioCase({
  family = "Credential Compromise",
  difficulty = "Beginner",
  randomness = "Medium",
  trainingMode = "Guided",
  seed = Date.now().toString(),
  caseNumber = 1
}: {
  family?: ScenarioFamily;
  difficulty?: ScenarioDifficulty;
  randomness?: ScenarioRandomness;
  trainingMode?: TrainingMode;
  seed?: string;
  caseNumber?: number;
} = {}): ScenarioCase {
  const random = makeRandom(`${seed}:${family}:${difficulty}:${randomness}:${trainingMode}:${caseNumber}`);
  const template = templates[family];
  const targetUser = pick(users, random);
  const targetHost = pick(hosts, random);
  const severity = severityForDifficulty(difficulty, random);
  const confidence = confidenceForSeverity(severity, random);
  const decoyCount = randomness === "Low" ? 2 : randomness === "Medium" ? 3 : 5;
  const keyEvents = template.keyEvents.map((event, index) => ({ event, key: true, index }));
  const decoyEvents = shuffle(template.decoyEvents, random).slice(0, decoyCount).map((event, index) => ({ event, key: false, index }));
  const rawEvents = trainingMode === "Blind Investigation" || randomness === "Chaos Lab"
    ? shuffle([...keyEvents, ...decoyEvents], random)
    : [...keyEvents, ...decoyEvents];
  const caseId = `ADV-2026-${caseNumber.toString().padStart(3, "0")}`;

  const telemetryEvents = rawEvents.map(({ event, key }, index): EvidenceEvent => ({
    event_id: `evt-${(index + 1).toString().padStart(3, "0")}`,
    timestamp: formatClock(30 + index * (randomness === "Chaos Lab" ? 17 : 12)),
    source: event.source,
    summary: `${event.summary} for ${targetUser}`,
    plain_english: event.plain_english,
    severity: event.severity,
    user: targetUser,
    host: key ? targetHost : pick(hosts, random),
    is_key_evidence: key,
    tags: event.tags
  }));

  const keyEvidenceIds = telemetryEvents.filter((event) => event.is_key_evidence).map((event) => event.event_id);
  const decoyIds = telemetryEvents.filter((event) => !event.is_key_evidence).map((event) => event.event_id);
  const falseLead = telemetryEvents.find((event) => !event.is_key_evidence)?.summary ?? "Routine background activity";

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
    prevention_lessons: template.preventionLessons
  };
}

export function generateDailyThreatQueue(seed = new Date().toDateString()) {
  const families: ScenarioFamily[] = [
    "Cloud Account Takeover",
    "Insider Data Drift",
    "Credential Compromise",
    "Exfiltration Signal",
    "Endpoint Activity"
  ];
  const difficulties: ScenarioDifficulty[] = ["Beginner", "Intermediate", "SOC", "Analyst", "Intermediate"];
  const randomness: ScenarioRandomness[] = ["Low", "Medium", "Medium", "Chaos Lab", "Low"];

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
