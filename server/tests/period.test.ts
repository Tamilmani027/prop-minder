import { currentPeriod, periodStart, buildDueDate } from '../src/utils/period';

describe('period helpers', () => {
  it('currentPeriod returns YYYY-MM in UTC', () => {
    // 2026-02-15T10:00:00Z is still February in UTC.
    const now = new Date(Date.UTC(2026, 1, 15, 10, 0, 0));
    expect(currentPeriod(now)).toBe('2026-02');
  });

  it('currentPeriod rolls over at month boundary', () => {
    const now = new Date(Date.UTC(2026, 2, 1, 0, 0, 0)); // 2026-03-01
    expect(currentPeriod(now)).toBe('2026-03');
  });

  it('periodStart returns the 1st of the month in UTC', () => {
    const start = periodStart('2026-03');
    expect(start.getUTCFullYear()).toBe(2026);
    expect(start.getUTCMonth()).toBe(2); // March is month index 2
    expect(start.getUTCDate()).toBe(1);
    expect(start.getUTCHours()).toBe(0);
    expect(start.getUTCMinutes()).toBe(0);
    expect(start.getUTCSeconds()).toBe(0);
    expect(start.getUTCMilliseconds()).toBe(0);
  });

  it('periodStart throws on invalid format', () => {
    expect(() => periodStart('2026-13')).toThrow('Invalid period format');
    expect(() => periodStart('not-a-period')).toThrow('Invalid period format');
  });

  it('buildDueDate returns the due day in UTC', () => {
    const due = buildDueDate('2026-03', 5);
    expect(due.getUTCFullYear()).toBe(2026);
    expect(due.getUTCMonth()).toBe(2);
    expect(due.getUTCDate()).toBe(5);
  });

  it('buildDueDate handles February', () => {
    const due = buildDueDate('2026-02', 28);
    expect(due.getUTCFullYear()).toBe(2026);
    expect(due.getUTCMonth()).toBe(1); // February
    expect(due.getUTCDate()).toBe(28);
  });

  it('buildDueDate with dueDay 1 returns the period start', () => {
    const due = buildDueDate('2026-07', 1);
    expect(due.getUTCDate()).toBe(1);
    expect(due.getUTCMonth()).toBe(6); // July
  });
});
