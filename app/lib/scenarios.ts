import type { BudgetSummary } from './budget';
import type { Holding } from './holdings';

// BQ-056 (D-106): scenario modelling batch 1 — S-05, S-03, S-06, S-07, S-01.
//
// Every function here is pure: no fetches, no storage, no side effects. Screens fetch the
// user's data, derive prefills, and let the user edit every field before computing.
//
// Two constraints shape this file and should survive any edit to it:
//   - The app never asserts a rate. Expected return, inflation, and savings-account rates are
//     always user inputs. An app-supplied "expected return" is a forecast the user would rely
//     on, which is a hard stop (CLAUDE.md); asking the user for it is not.
//   - Outputs are mechanism facts — a number of months, a rupee figure, a date. Never a verdict
//     about whether that number is good (P2/D-009), and never styled by valence (P10/D-087).
//
// Compounding convention: monthly compounding, ordinary annuity (contribution at period end).
// This matches CalculatorScreen's C-04/C-22 so the two surfaces can't disagree on the same input.

const SIP_TYPES = ['equity_mutual_fund', 'debt_mutual_fund'];
const LOAN_TYPES = ['home_loan', 'personal_loan', 'credit_card_debt'];

// `characteristics` is Record<string, unknown> — any field can be absent, a string, or junk.
// Every read goes through this guard (the NaN trap BQ-054's review surfaced).
function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ─── Prefill derivation ──────────────────────────────────────────────────────

export interface LoanPrefill {
  id: string;
  label: string;
  outstanding: number;
  interestRate: number;
  tenureMonths: number;
}

export interface ScenarioPrefills {
  // From budget. null = budget unavailable (API error) — distinct from 0.
  monthlySip: number | null;
  monthlyOutgoings: number | null;
  // From holdings. null = holdings unavailable.
  retirementBalance: number | null; // PPF / EPF current balance
  depositBalance: number | null; // FD principal (RD excluded — see below)
  investedCorpus: number | null; // everything with a current value or balance
  loans: LoanPrefill[];
}

export function derivePrefills(
  budget: BudgetSummary | null,
  holdings: Holding[] | null
): ScenarioPrefills {
  let monthlySip: number | null = null;
  let monthlyOutgoings: number | null = null;

  if (budget !== null) {
    monthlySip = budget.recurring_outflows
      .filter((o) => SIP_TYPES.includes(o.product_type))
      .reduce((sum, o) => sum + num(o.monthly_amount), 0);
    // Everything leaving the account each month: recurring commitments + planned discretionary.
    monthlyOutgoings = num(budget.recurring_outflows_total) + num(budget.discretionary_total);
  }

  let retirementBalance: number | null = null;
  let depositBalance: number | null = null;
  let investedCorpus: number | null = null;
  const loans: LoanPrefill[] = [];

  if (holdings !== null) {
    retirementBalance = 0;
    depositBalance = 0;
    investedCorpus = 0;

    for (const h of holdings) {
      const c = h.characteristics;
      switch (h.product_type) {
        case 'ppf_epf': {
          const bal = num(c.current_balance);
          retirementBalance += bal;
          investedCorpus += bal;
          break;
        }
        case 'fd_rd': {
          // `principal_or_monthly_amount` is a balance for an FD but a monthly instalment for an
          // RD — summing an RD's figure as if it were a balance would overstate the runway. Only
          // FDs (and entries with no mode recorded, which the form defaults to FD) are counted.
          const isRd = String(c.deposit_mode ?? '').toUpperCase() === 'RD';
          if (!isRd) {
            const bal = num(c.principal_or_monthly_amount);
            depositBalance += bal;
            investedCorpus += bal;
          }
          break;
        }
        case 'equity_mutual_fund':
        case 'debt_mutual_fund':
        case 'stocks':
          investedCorpus += num(c.current_value);
          break;
        default:
          break;
      }

      if (LOAN_TYPES.includes(h.product_type)) {
        loans.push({
          id: h.id,
          label: h.display_name ?? h.alias,
          outstanding: num(c.outstanding_balance) || num(c.principal),
          interestRate: num(c.interest_rate),
          tenureMonths: num(c.tenure_months),
        });
      }
    }
  }

  return { monthlySip, monthlyOutgoings, retirementBalance, depositBalance, investedCorpus, loans };
}

// ─── Shared: future value of a monthly contribution ──────────────────────────
// FV = P × ((1+r)^n − 1) / r, with r = annual/12/100 and n = months. Ordinary annuity.

export function sipFutureValue(monthly: number, annualRatePct: number, years: number): number {
  const n = Math.round(years * 12);
  if (n <= 0 || monthly <= 0) return 0;
  const r = annualRatePct / 12 / 100;
  if (r === 0) return monthly * n;
  return monthly * ((Math.pow(1 + r, n) - 1) / r);
}

// ─── S-03: What if I increase my SIP? ────────────────────────────────────────

export interface SipIncreaseResult {
  base: number; // corpus from the current SIP alone
  raised: number; // corpus from current + extra
  difference: number;
  extraInvested: number; // total rupees the extra SIP puts in
}

export function sipIncrease(
  currentSip: number,
  extraSip: number,
  annualRatePct: number,
  years: number
): SipIncreaseResult | null {
  if (!(years > 0) || !(extraSip > 0) || annualRatePct < 0) return null;
  const base = sipFutureValue(currentSip, annualRatePct, years);
  const raised = sipFutureValue(currentSip + extraSip, annualRatePct, years);
  return {
    base,
    raised,
    difference: raised - base,
    extraInvested: extraSip * Math.round(years * 12),
  };
}

// ─── S-06: What does my debt cost? ───────────────────────────────────────────
// Interest remaining over the rest of the tenure, plus the next 12 months of it. The
// 12-month figure is amortised month by month rather than approximated as balance × rate,
// because the balance falls as each EMI lands.

export interface DebtCostResult {
  emi: number;
  totalPayable: number;
  totalInterest: number;
  nextYearInterest: number;
}

export function debtCost(
  outstanding: number,
  annualRatePct: number,
  remainingMonths: number
): DebtCostResult | null {
  const n = Math.round(remainingMonths);
  if (!(outstanding > 0) || !(n > 0) || annualRatePct < 0) return null;

  const r = annualRatePct / 12 / 100;
  if (r === 0) {
    const emi = outstanding / n;
    return { emi, totalPayable: outstanding, totalInterest: 0, nextYearInterest: 0 };
  }

  const growth = Math.pow(1 + r, n);
  const emi = (outstanding * r * growth) / (growth - 1);
  const totalPayable = emi * n;

  let balance = outstanding;
  let nextYearInterest = 0;
  for (let m = 0; m < Math.min(12, n); m++) {
    const interest = balance * r;
    nextYearInterest += interest;
    balance = balance + interest - emi;
    if (balance <= 0) break;
  }

  return { emi, totalPayable, totalInterest: totalPayable - outstanding, nextYearInterest };
}

// ─── S-07: Idle cash over time ───────────────────────────────────────────────
// Both sides are user-entered rates. The app does not assert what a savings account pays or
// what an investment returns — it compounds the two numbers the user supplies and names the
// gap between them. The gap is a mechanism fact, not a claim that one path is correct.

export interface IdleCashResult {
  atSavingsRate: number;
  atAlternateRate: number;
  difference: number;
}

export function idleCashOpportunity(
  cashAmount: number,
  savingsRatePct: number,
  alternateRatePct: number,
  years: number
): IdleCashResult | null {
  if (!(cashAmount > 0) || !(years > 0) || savingsRatePct < 0 || alternateRatePct < 0) return null;
  const atSavingsRate = cashAmount * Math.pow(1 + savingsRatePct / 100, years);
  const atAlternateRate = cashAmount * Math.pow(1 + alternateRatePct / 100, years);
  return { atSavingsRate, atAlternateRate, difference: atAlternateRate - atSavingsRate };
}

// ─── S-01: When does my corpus reach my target? ──────────────────────────────
// D-106: the user sets the target. The app never derives one (a corpus formula would be a
// money-logic decision the app then has to defend). Month-by-month simulation, capped at 60
// years — past that the honest answer is "not on this path", not a larger number.

const MAX_MONTHS = 720;

export interface CorpusTargetResult {
  months: number | null; // null = target not reached within the cap
  years: number | null;
  alreadyReached: boolean;
}

export function monthsToTarget(
  currentCorpus: number,
  monthlySip: number,
  annualRatePct: number,
  target: number
): CorpusTargetResult | null {
  if (!(target > 0) || currentCorpus < 0 || monthlySip < 0 || annualRatePct < 0) return null;
  if (currentCorpus >= target) return { months: 0, years: 0, alreadyReached: true };
  // No contribution and no growth means the balance never moves — say so rather than looping.
  if (monthlySip === 0 && annualRatePct === 0) {
    return { months: null, years: null, alreadyReached: false };
  }

  const r = annualRatePct / 12 / 100;
  let balance = currentCorpus;
  for (let m = 1; m <= MAX_MONTHS; m++) {
    balance = balance * (1 + r) + monthlySip;
    if (balance >= target) return { months: m, years: m / 12, alreadyReached: false };
  }
  return { months: null, years: null, alreadyReached: false };
}
