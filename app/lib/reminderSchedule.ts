import type { Holding } from './holdings';

// Pure calendar arithmetic, deliberately free of Expo and AsyncStorage imports so the
// due-day contract can be proved under `node --test`.
export const REMINDER_HOUR = 9;
// Six months keeps recurrence resilient without consuming an entire device's finite
// pending-notification allowance, which is shared with the daily learning reminder.
export const REMINDER_OCCURRENCE_COUNT = 6;

export interface ReminderSchedule {
  /** The user's original selection. It is never rewritten after a short month. */
  selectedDay: number;
  body: string;
}

export interface ReminderOccurrence {
  date: Date;
  /** Whether this particular month used its final day. */
  clamped: boolean;
}

/** Extract the recurring due day from a supported holding. */
export function reminderScheduleFor(holding: Holding): ReminderSchedule | null {
  const c = holding.characteristics;
  const body = reminderBody(holding.product_type);

  if (holding.product_type === 'credit_card_debt') {
    if (typeof c.payment_due_date !== 'string') return null;
    // Parse the ISO date fields directly. Date.parse accepts rollover-like inputs on some
    // engines, which would quietly change the user's selected day.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(c.payment_due_date);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month - 1)) return null;
    return { selectedDay: day, body };
  }

  if (holding.product_type === 'home_loan' || holding.product_type === 'personal_loan') {
    if (typeof c.emi_due_day !== 'number' || !Number.isFinite(c.emi_due_day)) return null;
    const selectedDay = Math.floor(c.emi_due_day);
    if (selectedDay < 1 || selectedDay > 31) return null;
    return { selectedDay, body };
  }

  return null;
}

/**
 * Produce the next dated occurrences. Each month independently clamps to month-end,
 * so a 31st reminder becomes 28/29 in February and returns to 31 in March.
 */
export function nextReminderOccurrences(
  schedule: ReminderSchedule,
  now: Date = new Date(),
  count = REMINDER_OCCURRENCE_COUNT
): ReminderOccurrence[] {
  if (!Number.isFinite(now.getTime()) || !Number.isInteger(count) || count < 1) return [];

  const occurrences: ReminderOccurrence[] = [];
  let monthOffset = 0;
  while (occurrences.length < count) {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = firstOfMonth.getFullYear();
    const month = firstOfMonth.getMonth();
    const finalDay = daysInMonth(year, month);
    const day = Math.min(schedule.selectedDay, finalDay);
    const date = new Date(year, month, day, REMINDER_HOUR, 0, 0, 0);
    if (date.getTime() > now.getTime()) {
      occurrences.push({ date, clamped: day !== schedule.selectedDay });
    }
    monthOffset += 1;
  }
  return occurrences;
}

function daysInMonth(year: number, zeroBasedMonth: number): number {
  return new Date(year, zeroBasedMonth + 1, 0).getDate();
}

function reminderBody(productType: string): string {
  return productType === 'credit_card_debt'
    ? 'A payment date you recorded is coming up.'
    : 'An EMI date you recorded is coming up.';
}
