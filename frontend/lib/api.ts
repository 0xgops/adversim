import { scenarios as fallbackScenarios, simulation as fallbackSimulation } from "@/lib/mock-data";
import type {
  AIAnalystRequest,
  AIReportRequest,
  AIResponse,
  AIStatus,
  Scenario,
  SimulationRequest,
  SimulationResult
} from "@/types/adversim";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "https://adversim.onrender.com" : "http://localhost:8000");

async function fetchJson<T>(path: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }

    throw error;
  }
}

export function getScenarios(): Promise<Scenario[]> {
  return fetchJson<Scenario[]>("/api/scenarios", undefined, fallbackScenarios);
}

export function getLatestSimulation(): Promise<SimulationResult> {
  return fetchJson<SimulationResult>("/api/simulations/latest", undefined, fallbackSimulation);
}

export function runSimulation(request: SimulationRequest): Promise<SimulationResult> {
  return fetchJson<SimulationResult>(
    "/api/simulations/run",
    {
      method: "POST",
      body: JSON.stringify(request)
    },
    fallbackSimulation
  );
}

export function askAiAnalyst(request: AIAnalystRequest, fallback: AIResponse): Promise<AIResponse> {
  return fetchJson<AIResponse>(
    "/api/ai/analyst",
    {
      method: "POST",
      body: JSON.stringify(request)
    },
    fallback
  );
}

export function generateAiReport(request: AIReportRequest, fallback: AIResponse): Promise<AIResponse> {
  return fetchJson<AIResponse>(
    "/api/ai/report",
    {
      method: "POST",
      body: JSON.stringify(request)
    },
    fallback
  );
}

export function getAiStatus(sessionId = "local-demo"): Promise<AIStatus> {
  const fallback: AIStatus = {
    mode: "fallback-ready",
    enabled: true,
    has_api_key: false,
    model: "guarded-fallback",
    remaining_demo_calls: 0,
    message: "Backend AI status is unavailable. Guarded fallback remains ready."
  };

  return fetchJson<AIStatus>(`/api/ai/status?session_id=${encodeURIComponent(sessionId)}`, undefined, fallback);
}
