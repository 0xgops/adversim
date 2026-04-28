import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import AIAnalystRequest, AIReportRequest, AIResponse, AIStatus, SimulationRequest, SimulationResult
from app.services.ai_analyst import AIAnalystService
from app.services.simulator import generate_simulation, list_scenarios

app = FastAPI(
    title="AdverSim API",
    description="Safe synthetic adversary simulation API for blue-team training demos.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(
        {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            *[origin.strip() for origin in os.getenv("ADVERSIM_ALLOWED_ORIGINS", "").split(",") if origin.strip()],
        }
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_result: SimulationResult = generate_simulation(SimulationRequest())
ai_analyst = AIAnalystService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "adversim-api"}


@app.get("/api/scenarios")
def scenarios():
    return list_scenarios()


@app.post("/api/simulations/run")
def run_simulation(request: SimulationRequest) -> SimulationResult:
    global latest_result
    latest_result = generate_simulation(request)
    return latest_result


@app.get("/api/simulations/latest")
def latest_simulation() -> SimulationResult:
    return latest_result


@app.get("/api/telemetry")
def telemetry():
    return latest_result.telemetry


@app.get("/api/detections")
def detections():
    return latest_result.detections


@app.get("/api/timeline")
def timeline():
    return latest_result.timeline


@app.get("/api/reports/latest")
def latest_report() -> dict[str, str]:
    return {"markdown": latest_result.report_markdown}


@app.post("/api/ai/analyst")
def ai_analyst_explain(request: AIAnalystRequest) -> AIResponse:
    return ai_analyst.explain(request, latest_result)


@app.post("/api/ai/report")
def ai_report(request: AIReportRequest) -> AIResponse:
    return ai_analyst.report(request, latest_result)


@app.get("/api/ai/status")
def ai_status(session_id: str = "local-demo") -> AIStatus:
    return ai_analyst.status(session_id)
