# AdverSim

AdverSim is an AI-assisted mock-incident lab for blue-team training. A learner asks AI to create a safe synthetic security incident, then practices how defenders identify clues, read logs, reconstruct the timeline, and write the response.

It provides a safe defensive workflow:

1. Generate a randomized safe training case in Scenario Director.
2. Investigate an evidence board with key clues and decoy events.
3. Submit an analyst finding and receive an AI-style mentor debrief.
4. Generate safe synthetic security telemetry in the replay Builder.
5. Reconstruct an incident timeline and produce an analyst-ready report.

AdverSim does not implement real exploitation, malware, credential theft, evasion, or live targeting. All behavior is represented as synthetic logs for defensive education.

## Repository Layout

```text
adversim/
+-- frontend/     # Next.js, TypeScript, Tailwind UI
+-- backend/      # Python FastAPI API
+-- docs/         # Architecture and operating notes
+-- seed_assets/  # JSON-first seed data
+-- README.md
```

## Quick Start

### Backend

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs will be available at:

```text
http://localhost:8000/docs
```

#### Optional Live AI Analyst

AdverSim works without an API key by using guarded fallback responses. To enable live OpenAI-powered analyst explanations and report drafting, set the key only in the backend shell:

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:ADVERSIM_AI_MODEL="gpt-5-mini"
$env:ADVERSIM_AI_MAX_SESSION_CALLS="5"
$env:ADVERSIM_AI_MAX_DAILY_CALLS="100"
$env:ADVERSIM_AI_MAX_OUTPUT_TOKENS="700"
uvicorn app.main:app --reload --port 8000
```

Cost controls are enforced server-side with per-session limits, a daily call cap, cached repeat answers, and offline fallback when the key or budget is unavailable. Never place `OPENAI_API_KEY` in the frontend.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL` if your backend is not running on `http://localhost:8000`.

## Deployment Notes

Recommended production deployment:

- Frontend: Vercel with service root `adversim/frontend`
- Backend: Render or Railway with service root `adversim/backend`

Backend start command:

```powershell
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Backend environment variables:

```text
OPENAI_API_KEY=sk-...
ADVERSIM_AI_MODEL=gpt-5-mini
ADVERSIM_AI_MAX_SESSION_CALLS=5
ADVERSIM_AI_MAX_DAILY_CALLS=100
ADVERSIM_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

Optional Neon case-history schema:

```text
backend/db/case_history.sql
```

The frontend keeps the last five staged investigations locally for lightweight history. The SQL schema is ready for Neon when persistent user history is enabled.

Frontend environment variable:

```text
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
```

## Simulation Flow

The lab has two layers: Scenario Director for interactive investigation practice, and Adversary Builder for cinematic replay telemetry. The current environment includes nineteen ready scenario packages:

- Credential Compromise Chain
- Insider Data Drift
- Cloud Account Takeover
- Endpoint Activity
- Exfiltration Signal
- Lateral Movement
- Ransomware Precursor
- Supply Chain Compromise
- Spear-Phishing Campaign
- Web API Exploitation
- Shadow Persistence
- API Breach: Exfil Pulse
- Ransomware Stage: Alpha
- Insider Leak: Departure
- Zero-Day: Log-Pulse RCE
- Supply Chain: Poisoned Update
- Identity: Session Hijack
- Stealth: Resource Exhaustion
- Recon: Password Spraying

Each scenario package supports adjustable difficulty and noise controls:

- Beginner, Intermediate, and Expert investigation modes
- Low, Medium, and Chaos Lab background-noise injection

That creates high-replay lab runs across the nineteen scenario packages. Duration controls pacing, not the incident type.

## Scenario Package Model

AdverSim scenarios are defined as data packages in `frontend/lib/scenario-director.ts`. Each package contains:

- `missionBriefings`: analyst-facing case context
- `threatLogs`: key telemetry clues that support the incident narrative
- `backgroundNoise`: harmless events used to raise or lower investigation difficulty
- `expectedFindings`, `recommendedResponse`, and `preventionLessons`: investigation goals and report guidance

The Scenario Director reads the selected package, samples threat logs, injects background noise based on difficulty and randomness, recalculates dashboard charts, and builds the Evidence Board automatically. Adding a new synthetic incident means adding a new package entry, then the lab can stage it through the same telemetry, detection, timeline, and report flow.

Main navigation:

- Dashboard
- Scenario Director
- Adversary Builder
- Telemetry
- Detections
- Timeline
- Reports

## Roadmap

AdverSim v2.0 Roadmap: Future updates will transition from package-based incidents to LLM-Driven Scenario Generation, featuring integrated support for raw CTI feeds (Mandiant, CISA) and automated MITRE ATT&CK mapping for reactive defense training.
