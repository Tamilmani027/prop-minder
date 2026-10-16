import { periodSchema } from './zod';

// Returns a YYYY-MM string for the given date. Timezone handling is
// simplified: we treat the input as UTC so results are stable across servers.
export const currentPeriod = (now: Date): string => {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Returns the UTC date of the 1st day of the period (e.g. "2026-03" -> 2026-03-01).
export const periodStart = (period: string): Date => {
  if (!periodSchema.safeParse(period).success) {
    throw new Error('Invalid period format');
  }
  const parts = period.split('-').map(Number);
  const year = parts[0];
  const month = parts[1];
  if (year === undefined || month === undefined) {
    throw new Error('Invalid period format');
  }
  return new Date(Date.UTC(year, month - 1, 1));
};

// Returns the UTC due date for a period and day-of-month (e.g. dueDay 5 of
// "2026-02" -> 2026-02-05). Timezone handling is simplified to UTC.
export const buildDueDate = (period: string, dueDay: number): Date => {
  const start = periodStart(period);
  return new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), dueDay));
};
