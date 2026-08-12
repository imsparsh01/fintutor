import type { Holding } from './holdings';

// Pure day arithmetic, deliberately free of expo-notifications and AsyncStorage imports so it
// can be tested under `node --test` (same split as emergencyCoverage.ts vs its Tool component).
// The scheduling/permission side lives in reminders.ts.

// A monthly repeating trigger can only name a day that every month has. A reminder that
// arrives a few days early is harmless; one that silently skips February is not, so a due
// day past the 28th is pulled back rather than left to not fire at all.
const LAST_ALWAYS_PRESENT_DAY = 28;
export const REMINDER_HOUR = 9;

export interface ReminderSchedule {
  day: number;
  body: string;
  /** True when the stored due day was pulled back to keep every month covered. */
  clamped: boolean;
}

/**
 * Which day of the month this holding should remind on, if any.
 *
 * Both supported product types are monthly-cycle obligations: `emi_due_day` is stored as a
 * day-of-month outright, and a credit card's `payment_due_date` is a full date whose
 * day-of-month is the recurring due day.
 */
export function reminderScheduleFor(holding: Holding): ReminderSchedule | null {
  const c = holding.characteristics;
  const body = reminderBody(holding.product_type);

  if (holding.product_type === 'credit_card_debt') {
    if (typeof c.payment_due_date !== 'string') return null;
    const parsed = new Date(`${c.payment_due_date}T09:00:00`);
    if (Number.isNaN(parsed.getTime())) return null;
    return clampToMonthly(parsed.getDate(), body);
  }

  if (holding.product_type === 'home_loan' || holding.product_type === 'personal_loan') {
    if (typeof c.emi_due_day !== 'number' || !Number.isFinite(c.emi_due_day)) return null;
    const day = Math.floor(c.emi_due_day);
    if (day < 1 || day > 31) return null;
    return clampToMonthly(day, body);
  }

  return null;
}

function clampToMonthly(day: number, body: string): ReminderSchedule {
  const clamped = day > LAST_ALWAYS_PRESENT_DAY;
  return { day: clamped ? LAST_ALWAYS_PRESENT_DAY : day, body, clamped };
}

function reminderBody(productType: string): string {
  return productType === 'credit_card_debt'
    ? 'A payment date you recorded is coming up.'
    : 'An EMI date you recorded is coming up.';
}
