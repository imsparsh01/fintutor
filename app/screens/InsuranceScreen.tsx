import { HoldingsList } from '../components/HoldingsList';
import { INSURANCE_TYPES } from '../lib/taxonomy';

export function InsuranceScreen() {
  return (
    <HoldingsList
      title="Insurance"
      familyTypes={INSURANCE_TYPES}
      emptyHint="No insurance tracked yet — they'll show up here once surfaced or added."
    />
  );
}
