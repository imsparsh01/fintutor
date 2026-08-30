export interface ScenarioHandoffPayload {
  scenarioType: string;
  normalizedInputs: Record<string, string | number | null | undefined>;
  formulaBoundary: string;
  omissions: string;
}

const SAFE_TYPE = /^[a-z][a-z0-9_]*$/;
const SAFE_FIELD = /^[a-z][a-z0-9_]*$/;
const FORBIDDEN_FIELD = /(name|alias|institution|record|source|holding_id|goal_id|user_id)/;
const SAFE_STRING_VALUE = /^[a-zA-Z0-9_.:+-]+$/;

export function buildScenarioHandoffPrompt(payload: ScenarioHandoffPayload): string | null {
  if (!SAFE_TYPE.test(payload.scenarioType)) return null;
  const entries = Object.entries(payload.normalizedInputs);
  if (entries.length === 0 || entries.some(([key, value]) => !SAFE_FIELD.test(key) || FORBIDDEN_FIELD.test(key)
    || value === null || value === undefined
    || (typeof value === 'number' && !Number.isFinite(value))
    || (typeof value === 'string' && (!SAFE_STRING_VALUE.test(value) || value.length > 80)))) return null;
  if (!payload.formulaBoundary.trim() || !payload.omissions.trim()) return null;
  const inputs = entries.map(([key, value]) => `${key}=${value}`).join('; ');
  return [
    'Teach me the mechanism behind this FinTutor scenario without recommending an action.',
    `Scenario type: ${payload.scenarioType}.`,
    `Normalized inputs: ${inputs}.`,
    `Formula boundary: ${payload.formulaBoundary}`,
    `Omissions: ${payload.omissions}`,
    'Explain the arithmetic mechanism and its limits. Do not choose, rank, or recommend a path.',
  ].join('\n');
}
