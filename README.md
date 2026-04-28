# AdverSim

AdverSim is an AI-assisted mock-incident lab for blue-team training. A learner asks AI to create a safe synthetic security incident, then practices how defenders identify clues, read logs, reconstruct the timeline, and write the response.

It demonstrates a safe defensive workflow:

1. Generate a randomized safe training case in Scenario Director.
2. Investigate an evidence board with key clues and decoy events.
3. Submit an analyst finding and receive an AI-style mentor debrief.
4. Generate safe synthetic security telemetry in the replay Builder.
5. Reconstruct an incident timeline and produce an analyst-ready report.

AdverSim does not implement real exploitation, malware, credential theft, evasion, or live targeting. All behavior is represented as synthetic logs for defensive education.

## Project Structure

```text
adversim/
+-- frontend/     # Next.js, TypeScript, Tailwind UI
+-- backend/      # Python FastAPI API
+-- docs/         # Architecture and demo notes
+-- demo_assets/  # JSON-first demo data
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

Recommended competition deploy:

- Frontend: Vercel with project root `adversim/frontend`
- Backend: Render or Railway with project root `adversim/backend`

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

Frontend environment variable:

```text
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com
```

## Demo Flow

The lab now has two layers: Scenario Director for interactive investigation practice, and Adversary Builder for cinematic replay telemetry. The initial vertical slice includes two polished ready scenario families:

**Credential Compromise Chain**

- Failed login pattern
- Successful login from unusual source
- Suspicious command execution
- Privilege escalation attempt
- File discovery behavior
- Large outbound transfer
- Critical incident report

**Insider Data Drift**

- After-hours sensitive file access
- File access burst across HR and Finance paths
- DLP-style sensitive label matches
- Archive staging behavior
- External sharing event
- Outbound upload drift
- Insider-risk incident report

Each ready scenario supports nine training profiles:

- Clean / Low, Medium, High
- Realistic / Low, Medium, High
- Noisy / Low, Medium, High

That creates 18 guided lab runs across the two scenario families. Duration controls pacing, not the incident type.

Main navigation:

- Dashboard
- Scenario Director
- Adversary Builder
- Telemetry
- Detections
- Timeline
- Reports

## Roadmap

- Persist generated simulations to JSON files
- Add SQLite storage
- Expand detection rules
- Add report export to PDF
- Add additional scenario templates
- Connect Scenario Director debriefs to live AI when demo budget allows


