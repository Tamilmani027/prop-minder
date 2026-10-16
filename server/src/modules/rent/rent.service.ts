import mongoose from "mongoose";
import { RentCharge, type RentChargeDoc } from "./rent.model";
import { deriveChargeStatus, type ChargeStatus } from "./rent.status";
import { Lease } from "../lease/lease.model";
import { Tenant } from "../tenant/tenant.model";
import { Unit } from "../unit/unit.model";
import { periodStart, buildDueDate } from "../../utils/period";
import { periodSchema } from "../../utils/zod";
import { paginate, listResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";

// Start of today in UTC, used to decide overdue vs pending/partial.
const startOfToday = (now: Date): Date => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// Mongo $expr filter matching deriveChargeStatus exactly. Keep these two in
// sync: if the status rules change, update both here and in rent.status.ts.
// Shared status filter used by both the rent charge list and the dashboard so
// the two can never drift apart. Mirrors deriveChargeStatus in rent.status.ts.
export const statusFilter = (
  status: ChargeStatus,
  today: Date
): Record<string, unknown> | null => {
  switch (status) {
    case "paid":
      return { $expr: { $gte: ["$paidPaise", "$amountPaise"] } };
    case "overdue":
      return {
        $and: [
          { $expr: { $lt: ["$paidPaise", "$amountPaise"] } },
          { $expr: { $lt: ["$dueDate", today] } },
        ],
      };
    case "partial":
      return {
        $and: [
          { $expr: { $gt: ["$paidPaise", 0] } },
          { $expr: { $lt: ["$paidPaise", "$amountPaise"] } },
          { $expr: { $gte: ["$dueDate", today] } },
        ],
      };
    case "pending":
      return {
        $and: [
          { $expr: { $eq: ["$paidPaise", 0] } },
          { $expr: { $gte: ["$dueDate", today] } },
        ],
      };
  }
  return null;
};

export async function generateCharges(
  orgId: mongoose.Types.ObjectId,
  period: string
) {
  if (!periodSchema.safeParse(period).success) {
    throw new AppError(400, "BAD_REQUEST", "Invalid period");
  }

  const start = periodStart(period);

  // Load active leases that apply to the period:
  //   startDate month <= period, AND (no endDate or endDate month >= period)
  // We compare year-month strings (lexicographic compare works for YYYY-MM)
  // via $dateToString. An absent endDate counts as "no end date" via
  // $eq: ['$endDate', null], which is true for both null and missing fields.
  const leases = await Lease.find({
    orgId,
    status: "active",
    $expr: {
      $and: [
        {
          $lte: [
            { $dateToString: { format: "%Y-%m", date: "$startDate" } },
            period,
          ],
        },
        {
          $or: [
            { $expr: { $eq: ["$endDate", null] } },
            {
              $gte: [
                { $dateToString: { format: "%Y-%m", date: "$endDate" } },
                period,
              ],
            },
          ],
        },
      ],
    },
  });

  if (leases.length === 0) {
    return { period, created: 0, skipped: 0 };
  }

  // Batch-load the needed tenants and units in two queries (no per-lease
  // lookups) so we can build the name/label snapshots.
  const tenantIds = [...new Set(leases.map((l) => l.tenantId.toString()))];
  const unitIds = [...new Set(leases.map((l) => l.unitId.toString()))];

  const tenants = await Tenant.find({ _id: { $in: tenantIds }, orgId });
  const units = await Unit.find({ _id: { $in: unitIds }, orgId });

  const tenantById = new Map(tenants.map((t) => [t._id.toString(), t.name]));
  const unitById = new Map(units.map((u) => [u._id.toString(), u.label]));

  let created = 0;
  let skipped = 0;

  for (const lease of leases) {
    const charge = {
      orgId,
      leaseId: lease._id,
      unitId: lease.unitId,
      tenantId: lease.tenantId,
      tenantName: tenantById.get(lease.tenantId.toString()) ?? "",
      unitLabel: unitById.get(lease.unitId.toString()) ?? "",
      period,
      amountPaise: lease.rentPaise,
      dueDate: buildDueDate(period, lease.dueDay),
      paidPaise: 0,
    };

    try {
      // Mongoose typed create() doesn't accept a plain object literal; cast
      // through any.
      await RentCharge.create(charge as any);
      created++;
    } catch (error) {
      // The unique index on { orgId, leaseId, period } makes generation
      // idempotent: a duplicate key (11000) means the charge already exists,
      // so we count it as skipped rather than failing the whole batch.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).code === 11000) {
        skipped++;
      } else {
        throw error;
      }
    }
  }

  return { period, created, skipped };
}

export async function listCharges(
  orgId: mongoose.Types.ObjectId,
  input: {
    period?: string;
    status?: ChargeStatus;
    leaseId?: string;
    tenantId?: string;
    page: number;
    limit: number;
  }
) {
  const { page, limit, skip } = paginate(input);
  const { period, status, leaseId, tenantId } = input;
  const today = startOfToday(new Date());

  const filter: Record<string, unknown> = { orgId };
  if (period) filter.period = period;
  if (leaseId) filter.leaseId = leaseId;
  if (tenantId) filter.tenantId = tenantId;
  if (status) {
    const sf = statusFilter(status, today);
    if (sf) Object.assign(filter, sf);
  }

  const [data, total] = await Promise.all([
    RentCharge.find(filter)
      .sort({ dueDate: 1, tenantName: 1 })
      .skip(skip)
      .limit(limit),
    RentCharge.countDocuments(filter),
  ]);

  const now = new Date();
  const charges = data.map((c) => ({
    ...c.toObject(),
    status: deriveChargeStatus(c, now),
  }));

  return listResponse(charges, total, page, limit);
}

export async function getCharge(
  orgId: mongoose.Types.ObjectId,
  id: string
) {
  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any.
  const charge = await RentCharge.findOne({ _id: id, orgId } as any);
  if (!charge) {
    throw AppError.notFound("Rent charge not found");
  }
  const now = new Date();
  return { ...charge.toObject(), status: deriveChargeStatus(charge, now) };
}
