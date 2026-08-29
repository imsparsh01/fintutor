// D-170/D-171: one deterministic numeric boundary for every Scenario surface.
// UI wiring follows in BQ-141; this pure parser is dependency-free and independently tested.

export const MAX_SCENARIO_MONTHLY_AMOUNT = 1_000_000_000;
export const MAX_SCENARIO_AMOUNT = 1_000_000_000_000;
export const MAX_SCENARIO_MONEY_OUTPUT = 1_000_000_000_000_000;
export const MAX_SCENARIO_RATE_PERCENT = 100;

export type ParsedScenarioNumber = { value: number; normalized: string };

export function parseScenarioNumber(raw: string): ParsedScenarioNumber | null {
  const text = raw.trim();
  if (text === '' || /[eE]/.test(text)) return null;

  const plain = /^[+-]?\d+(?:\.\d+)?$/;
  const indianGrouped = /^[+-]?\d{1,2}(?:,\d{2})*,\d{3}(?:\.\d+)?$/;
  const internationalGrouped = /^[+-]?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/;
  if (!plain.test(text) && !indianGrouped.test(text) && !internationalGrouped.test(text)) {
    return null;
  }

  const value = Number(text.replaceAll(',', ''));
  if (!Number.isFinite(value)) return null;
  const normalizedValue = Object.is(value, -0) ? 0 : value;
  return { value: normalizedValue, normalized: String(normalizedValue) };
}

export function finiteMoneyOutput(...values: number[]): boolean {
  return values.every(
    (value) => Number.isFinite(value) && Math.abs(value) <= MAX_SCENARIO_MONEY_OUTPUT
  );
}
