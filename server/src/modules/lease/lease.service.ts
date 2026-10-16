import mongoose from "mongoose";
import { Lease, type LeaseDoc } from "./lease.model";
import { Unit } from "../unit/unit.model";
import { Tenant } from "../tenant/tenant.model";
import { paginate, listResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";

export async function createLease(
  orgId: mongoose.Types.ObjectId,
  input: {
    unitId: string;
    tenantId: string;
    rentPaise: number;
    depositPaise: number;
    dueDay: number;
    startDate: string;
    endDate?: string;
  }
) {
  const { unitId, tenantId, rentPaise, depositPaise, dueDay, startDate, endDate } = input;

  // Verify the unit exists in the caller's org.
  const unit = await Unit.findOne({ _id: unitId, orgId });
  if (!unit) {
    throw AppError.notFound("Unit not found");
  }

  // Verify the tenant exists in the caller's org.
  const tenant = await Tenant.findOne({ _id: tenantId, orgId });
  if (!tenant) {
    throw AppError.notFound("Tenant not found");
  }

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // endDate must not be before startDate.
  if (end && end < start) {
    throw new AppError(400, "BAD_REQUEST", "endDate must be >= startDate");
  }

  try {
    const lease = await Lease.create(
      {
        orgId,
        unitId,
        tenantId,
        rentPaise,
        depositPaise: depositPaise ?? 0,
        dueDay,
        startDate: start,
        endDate,
        status: "active",
      } as any
    );
    // Mongoose typed create() doesn't accept a plain object literal; cast
    // through any. Return type cast through unknown for the service boundary.
    return lease as unknown as LeaseDoc;
  } catch (error) {
    // The partial unique index on { orgId, unitId } where status = 'active'
    // rejects a second active lease for the same unit (Mongo code 11000).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      throw new AppError(409, "CONFLICT", "This unit already has an active lease");
    }
    throw error;
  }
}

export async function listLeases(
  orgId: mongoose.Types.ObjectId,
  input: {
    status?: "active" | "ended";
    unitId?: string;
    tenantId?: string;
    page: number;
    limit: number;
  }
) {
  const { page, limit, skip } = paginate(input);
  const { status, unitId, tenantId } = input;

  const filter: Record<string, unknown> = { orgId };
  if (status) filter.status = status;
  if (unitId) filter.unitId = unitId;
  if (tenantId) filter.tenantId = tenantId;

  // Populate with match: { orgId } so we only hydrate in-org references — a
  // defense-in-depth tenant guard in case a lease ever references a unit or
  // tenant outside the caller's org.
  const [data, total] = await Promise.all([
    Lease.find(filter)
      .populate({ path: "tenant", select: "name phone", match: { orgId } })
      .populate({ path: "unit", select: "label", match: { orgId } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Lease.countDocuments(filter),
  ]);

  return listResponse(data as unknown as LeaseDoc[], total, page, limit);
}

export async function getLease(orgId: mongoose.Types.ObjectId, id: string) {
  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any.
  const lease = await Lease.findOne({ _id: id, orgId } as any)
    .populate({ path: "tenant", select: "name phone", match: { orgId } })
    .populate({ path: "unit", select: "label", match: { orgId } });

  if (!lease) {
    throw AppError.notFound("Lease not found");
  }

  return lease as unknown as LeaseDoc;
}

export async function updateLease(
  orgId: mongoose.Types.ObjectId,
  id: string,
  input: Partial<{
    rentPaise: number;
    depositPaise: number;
    dueDay: number;
    endDate: string;
  }>
) {
  const keys = Object.keys(input);
  if (keys.length === 0) {
    throw new AppError(400, "BAD_REQUEST", "No fields to update");
  }

  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any.
  const lease = await Lease.findOne({ _id: id, orgId } as any);
  if (!lease) {
    throw AppError.notFound("Lease not found");
  }

  // Ended leases cannot be edited.
  if (lease.status === "ended") {
    throw new AppError(409, "CONFLICT", "Ended leases cannot be edited");
  }

  const { rentPaise, depositPaise, dueDay, endDate } = input;

  if (rentPaise !== undefined) lease.rentPaise = rentPaise;
  if (depositPaise !== undefined) lease.depositPaise = depositPaise;
  if (dueDay !== undefined) lease.dueDay = dueDay;
  if (endDate !== undefined) {
    const end = new Date(endDate);
    if (end < lease.startDate) {
      throw new AppError(400, "BAD_REQUEST", "endDate must be >= startDate");
    }
    lease.endDate = end;
  }

  await lease.save();
  return lease as unknown as LeaseDoc;
}

export async function endLease(orgId: mongoose.Types.ObjectId, id: string) {
  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any.
  const lease = await Lease.findOne({ _id: id, orgId } as any);
  if (!lease) {
    throw AppError.notFound("Lease not found");
  }

  // Ending an already-ended lease is a conflict.
  if (lease.status === "ended") {
    throw new AppError(409, "CONFLICT", "Lease is already ended");
  }

  lease.status = "ended";
  if (!lease.endDate) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    lease.endDate = today;
  }

  await lease.save();
  return lease as unknown as LeaseDoc;
}
