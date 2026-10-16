import mongoose from "mongoose";
import { RentCharge } from "../rent/rent.model";
import { Unit } from "../unit/unit.model";
import { Lease } from "../lease/lease.model";
import { deriveChargeStatus, type ChargeStatus } from "../rent/rent.status";
import { statusFilter } from "../rent/rent.service";
import { currentPeriod } from "../../utils/period";
import { periodSchema } from "../../utils/zod";
import { AppError } from "../../utils/AppError";

// Start of today in UTC, used to decide overdue vs pending/partial.
const startOfToday = (now: Date): Date => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export async function getDashboard(
  orgId: mongoose.Types.ObjectId,
  period?: string
) {
  const resolvedPeriod = period ?? currentPeriod(new Date());

  if (!periodSchema.safeParse(resolvedPeriod).success) {
    throw new AppError(400, "BAD_REQUEST", "Invalid period");
  }

  const today = startOfToday(new Date());
  const baseFilter = { orgId, period: resolvedPeriod };

  // Money totals: ONE aggregation.
  // The pipeline MUST start with { $match: { orgId, period } }. Aggregation does
  // NOT cast strings to ObjectId, so orgId must be a real mongoose.Types.ObjectId
  // (not the raw string) or it would match nothing.
  const totals = (await RentCharge.aggregate([
    {
      $match: {
        orgId: new mongoose.Types.ObjectId(orgId),
        period: resolvedPeriod,
      },
    },
    {
      $group: {
        _id: null,
        totalDuePaise: { $sum: "$amountPaise" },
        collectedPaise: { $sum: "$paidPaise" },
        overduePaise: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$paidPaise", "$amountPaise"] },
                  { $lt: ["$dueDate", today] },
                ],
              },
              { $subtract: ["$amountPaise", "$paidPaise"] },
              0,
            ],
          },
        },
      },
    },
  ])) as Array<{
    totalDuePaise: number;
    collectedPaise: number;
    overduePaise: number;
  }>;

  const totalDuePaise = totals[0]?.totalDuePaise ?? 0;
  const collectedPaise = totals[0]?.collectedPaise ?? 0;
  const overduePaise = totals[0]?.overduePaise ?? 0;
  const pendingPaise = totalDuePaise - collectedPaise;

  // Status counts mirror deriveChargeStatus via the shared statusFilter so they
  // can never drift from the rent charge list logic.
  const statuses: ChargeStatus[] = ["paid", "partial", "overdue", "pending"];
  const countResults = await Promise.all(
    statuses.map((s) =>
      RentCharge.countDocuments({
        ...baseFilter,
        ...(statusFilter(s, today) ?? {}),
      })
    )
  );
  const [paidCount, partialCount, overdueCount, pendingCount] = countResults;
  const charges = await RentCharge.countDocuments(baseFilter);

  // Occupancy
  const unitsTotal = await Unit.countDocuments({ orgId });
  const unitsOccupied = await Lease.countDocuments({
    orgId,
    status: "active",
  });

  // Overdue list: up to 10 overdue charges, oldest dueDate first.
  const overdueCharges = await RentCharge.find({
    ...baseFilter,
    ...(statusFilter("overdue", today) ?? {}),
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .select("tenantName unitLabel dueDate amountPaise paidPaise");

  const overdueList = overdueCharges.map((c) => ({
    id: c._id.toString(),
    tenantName: c.tenantName,
    unitLabel: c.unitLabel,
    dueDate: c.dueDate,
    balancePaise: c.amountPaise - c.paidPaise,
  }));

  return {
    period: resolvedPeriod,
    totalDuePaise,
    collectedPaise,
    pendingPaise,
    overduePaise,
    counts: {
      charges,
      paid: paidCount,
      partial: partialCount,
      overdue: overdueCount,
      pending: pendingCount,
    },
    occupancy: {
      unitsTotal,
      unitsOccupied,
    },
    overdueList,
  };
}
