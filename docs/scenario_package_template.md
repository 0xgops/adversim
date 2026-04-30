# AdverSim Scenario Package Template

Use this shape when drafting new synthetic investigations. Keep every event defensive, fictional, and non-operational.

```text
CASE_PACKAGE_###: SHORT_MACHINE_NAME

METADATA
CASE_ID: ADV-2026-###
TITLE: Human-readable title
DIFFICULTY: Beginner | Intermediate | Expert
MITRE_ATTACK: T####, T####.###

MISSION_BRIEFING
SUMMARY: One-line operator summary.
TARGET_USER: synthetic.user
TARGET_HOST: HOST-NAME-001
BRIEFING_TEXT: A clear analyst-facing paragraph that sets the investigation context.

OPERATIONAL_GUIDANCE
GUIDANCE_TEXT: What the analyst should correlate. Avoid revealing the answer outright.

THREAT_LOGS
SEQ_1 | COMPONENT: AUTH | EVENT: EVENT_NAME | DETAIL: Synthetic event detail | SEVERITY: LOW|MEDIUM|HIGH|CRITICAL | MITRE: T####
SEQ_2 | COMPONENT: ENDPOINT | EVENT: EVENT_NAME | DETAIL: Synthetic event detail | SEVERITY: LOW|MEDIUM|HIGH|CRITICAL | MITRE: T####
SEQ_3 | COMPONENT: NETWORK | EVENT: EVENT_NAME | DETAIL: Synthetic event detail | SEVERITY: LOW|MEDIUM|HIGH|CRITICAL | MITRE: T####

BACKGROUND_NOISE_POOL
NOISE_1 | COMPONENT: AUTH | EVENT: USER_LOGIN | DETAIL: Harmless background event
NOISE_2 | COMPONENT: ENDPOINT | EVENT: SERVICE_START | DETAIL: Harmless maintenance event
NOISE_3 | COMPONENT: NETWORK | EVENT: HEARTBEAT | DETAIL: Harmless network event
```

## How It Maps Into AdverSim

- `TITLE` becomes a package title.
- `DIFFICULTY` becomes `defaultDifficulty`.
- `TARGET_USER` and `TARGET_HOST` become package-specific target pools.
- `BRIEFING_TEXT` becomes `missionBriefings`.
- `GUIDANCE_TEXT` becomes `operationalGuidance`.
- `THREAT_LOGS` become `threatLogs`.
- `BACKGROUND_NOISE_POOL` becomes `backgroundNoise`.
- MITRE IDs should be preserved with `source_ref`.

## Writing Rules

- Use synthetic users, hosts, domains, and reserved lab IPs.
- Do not include working exploit commands, malware code, credential theft instructions, evasion steps, or live targeting details.
- For dangerous-looking process details, write sanitized telemetry such as `shell-like process telemetry; command content redacted for safety`.
- Make each threat log teach one defensive signal.
- Make each noise event plausible but clearly harmless after inspection.
