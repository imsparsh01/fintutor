// D-100: mechanism-only reward facts. Selection is independent of user data.
export const REWARD_FACTS = [
  'An EMI is made of two moving parts: interest for the period and a reduction in principal.',
  'A fund’s expense ratio is taken from the fund’s assets; it is not a separate bill you receive.',
  'A premium pays for the insurance promise during its stated period. Premium and cash value are different mechanisms.',
  'Compounding applies growth to earlier growth as well as to the amount first put in.',
  'A credit-card minimum due keeps an account current; it does not by itself set a fixed payoff date.',
];
export function randomRewardFact(): string { return REWARD_FACTS[Math.floor(Math.random() * REWARD_FACTS.length)]; }
