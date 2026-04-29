import type {
  ScenarioDifficulty,
  ScenarioFamily,
  ScenarioRandomness,
  TrainingMode
} from "@/types/adversim";

export const scenarioFamilies: ScenarioFamily[] = [
  "Credential Compromise",
  "Insider Data Drift",
  "Cloud Account Takeover",
  "Endpoint Activity",
  "Exfiltration Signal",
  "Lateral Movement",
  "Ransomware Precursor"
];

export const scenarioDifficulties: ScenarioDifficulty[] = ["Beginner", "Intermediate", "Expert"];
export const scenarioRandomnessLevels: ScenarioRandomness[] = ["Low", "Medium", "Chaos Lab"];
export const trainingModes: TrainingMode[] = ["Guided", "Blind Investigation"];
