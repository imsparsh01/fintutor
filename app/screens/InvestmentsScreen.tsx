import { HoldingsList } from '../components/HoldingsList';
import { INVESTMENT_TYPES } from '../lib/taxonomy';

export function InvestmentsScreen() {
  return (
    <HoldingsList
      title="Investments"
      familyTypes={INVESTMENT_TYPES}
      emptyHint="No investments tracked yet — they'll show up here once surfaced or added."
    />
  );
}
