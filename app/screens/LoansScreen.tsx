import { HoldingsList } from '../components/HoldingsList';
import { LOAN_TYPES } from '../lib/taxonomy';

export function LoansScreen() {
  return (
    <HoldingsList
      title="Loans"
      familyTypes={LOAN_TYPES}
      emptyHint="No loans tracked yet — they'll show up here once surfaced or added."
    />
  );
}
