export type ChargeStatus = "paid" | "partial" | "overdue" | "pending";

// Pure function: derives a charge's status from its amounts, due date, and
// "now". Status is NEVER stored in the database; it is always computed on read
// so it stays accurate as payments are recorded (next step).
//
// Order matches the spec exactly:
//   1. paid   if paidPaise >= amountPaise
//   2. overdue if dueDate is before the start of today (UTC)
//   3. partial if paidPaise > 0
//   4. pending otherwise
//
// Note: a partially paid charge past its due date is 'overdue' because the
// overdue check runs before the partial check.
export const deriveChargeStatus = (
  charge: { amountPaise: number; paidPaise: number; dueDate: Date },
  now: Date
): ChargeStatus => {
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const startOfDue = new Date(
    Date.UTC(
      charge.dueDate.getUTCFullYear(),
      charge.dueDate.getUTCMonth(),
      charge.dueDate.getUTCDate()
    )
  );

  if (charge.paidPaise >= charge.amountPaise) return "paid";
  if (startOfDue < startOfToday) return "overdue";
  if (charge.paidPaise > 0) return "partial";
  return "pending";
};
