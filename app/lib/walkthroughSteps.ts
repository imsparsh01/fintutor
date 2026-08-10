import type { WalkthroughStep } from '../components/TeachingWalkthrough';

const handoff = (family: string): WalkthroughStep => ({
  title: 'When you want to apply this',
  body: `This walkthrough is the map. When you're ready, open Chat and tell FinTutor what you already have in ${family}; it can then explain the mechanism against your own numbers. Nothing is saved from this walkthrough itself.`,
});

export const INVESTMENT_WALKTHROUGH: WalkthroughStep[] = [
  {
    title: 'What lives here',
    body: 'Investments are money set aside with the hope of growing or preserving value. Funds, direct holdings, deposits, provident accounts, and employee stock options each behave differently.',
  },
  {
    title: 'The mechanism is the point',
    body: 'Some values move with markets, some earn a stated rate, and some are locked to a schedule. The useful question is not just what something is called, but what makes its value change and when you can access it.',
  },
  handoff('investments'),
];

export const LOAN_WALKTHROUGH: WalkthroughStep[] = [
  {
    title: 'What lives here',
    body: 'Loans are money owed over time: home loans, personal loans, and credit-card debt. Each has a different obligation shape.',
  },
  {
    title: 'The mechanism is the point',
    body: 'The rate, security, repayment schedule, and minimum due determine how an obligation behaves. A schedule can shorten or stretch as rates and payments change; revolving debt has no fixed payoff date unless the balance is cleared.',
  },
  handoff('loans'),
];

export const INSURANCE_WALKTHROUGH: WalkthroughStep[] = [
  {
    title: 'What lives here',
    body: 'Insurance can be protection-only cover or a policy that combines protection with a savings or market-linked layer.',
  },
  {
    title: 'The mechanism is the point',
    body: 'Protection-only cover charges a premium for a defined promise during a defined period. Combined policies add another layer whose value follows its own schedule. The two mechanisms should be understood separately even when they appear in one policy.',
  },
  handoff('insurance'),
];
