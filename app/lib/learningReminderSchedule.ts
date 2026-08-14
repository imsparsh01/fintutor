export const LEARNING_REMINDER_HORIZON = 7;

export const LEARNING_REMINDER_COPY = [
  'Explore one money mechanism at your own pace.',
  'Open FinTutor for a short learning moment.',
  'Continue learning about how money mechanisms work.',
] as const;

export type LearningReminderOccurrence = { date: Date; body: string };

/** Produces one local-time occurrence per day, starting with the next future time. */
export function nextLearningReminderOccurrences(
  hour: number,
  minute: number,
  now: Date = new Date(),
  count = LEARNING_REMINDER_HORIZON
): LearningReminderOccurrence[] {
  if (!validReminderTime(hour, minute) || !Number.isFinite(now.getTime()) || !Number.isInteger(count) || count < 1) return [];
  const occurrences: LearningReminderOccurrence[] = [];
  let dayOffset = 0;
  while (occurrences.length < count) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hour, minute, 0, 0);
    if (date.getTime() > now.getTime()) {
      occurrences.push({ date, body: copyForLocalDate(date) });
    }
    dayOffset += 1;
  }
  return occurrences;
}

export function validReminderTime(hour: number, minute: number): boolean {
  return Number.isInteger(hour) && hour >= 0 && hour <= 23
    && Number.isInteger(minute) && minute >= 0 && minute <= 59;
}

function copyForLocalDate(date: Date): string {
  // Calendar-based rotation stays deterministic across reschedules and contains no user data.
  const dayKey = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return LEARNING_REMINDER_COPY[dayKey % LEARNING_REMINDER_COPY.length];
}
