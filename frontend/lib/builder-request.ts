import type { SimulationRequest } from "@/types/adversim";

export const defaultBuilderRequest: SimulationRequest = {
  scenario_id: "credential-compromise-chain",
  target_user: "finance.admin",
  target_host: "NYC-WKS-014",
  intensity: "Medium",
  duration: "30 minutes",
  noise_level: "Realistic"
};

export function readInitialBuilderRequest(): SimulationRequest {
  if (typeof window === "undefined") {
    return defaultBuilderRequest;
  }

  return window.localStorage.getItem("adversim-guided-launch") === "true"
    ? { ...defaultBuilderRequest, duration: "15 minutes" }
    : defaultBuilderRequest;
}
