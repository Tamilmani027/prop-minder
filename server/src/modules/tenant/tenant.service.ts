import mongoose from "mongoose";
import { Tenant, type TenantDoc } from "./tenant.model";
import { Lease } from "../lease/lease.model";
import { paginate, listResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";

// Escape regex metacharacters so a client-supplied search string is treated as
// a literal substring rather than a regex pattern. Without this, input such as
// "(" or ")" would be interpreted as regex syntax, causing unintended matches
// or a thrown "Invalid regular expression" error.
const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export async function createTenant(
  orgId: mongoose.Types.ObjectId,
  input: { name: string; phone: string; email?: string; notes?: string }
) {
  const tenant = await Tenant.create({
    orgId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    notes: input.notes,
  } as any);
  // Mongoose typed create() doesn't accept a plain object literal; cast
  // through any. Return type cast through unknown for the service boundary.
  return tenant as unknown as TenantDoc;
}

export async function listTenants(
  orgId: mongoose.Types.ObjectId,
  input: { q?: string; page: number; limit: number }
) {
  const { q } = input;
  const { page, limit, skip } = paginate(input);

  const filter: Record<string, unknown> = { orgId };
  if (q) {
    const escaped = escapeRegExp(q);
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { phone: { $regex: escaped, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Tenant.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Tenant.countDocuments(filter),
  ]);

  return listResponse(data as unknown as TenantDoc[], total, page, limit);
}

export async function getTenant(orgId: mongoose.Types.ObjectId, id: string) {
  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any.
  const tenant = await Tenant.findOne({ _id: id, orgId } as any);

  if (!tenant) {
    throw AppError.notFound("Tenant not found");
  }

  return tenant as unknown as TenantDoc;
}

export async function updateTenant(
  orgId: mongoose.Types.ObjectId,
  id: string,
  input: Partial<{ name: string; phone: string; email?: string; notes?: string }>
) {
  // Mongoose filter typing doesn't allow mixing string ids with ObjectId
  // _id field types; cast through any for both the filter and the $set.
  const tenant = await Tenant.findOneAndUpdate(
    { _id: id, orgId } as any,
    { $set: input } as any,
    { new: true }
  );

  if (!tenant) {
    throw AppError.notFound("Tenant not found");
  }

  return tenant as unknown as TenantDoc;
}

export async function deleteTenant(orgId: mongoose.Types.ObjectId, id: string) {
  // Reject deletion if the tenant has any lease in this org.
  // Mongoose filter typing; cast through any.
  const hasLease = await Lease.exists({ orgId, tenantId: id } as any);
  if (hasLease) {
    throw new AppError(409, "CONFLICT", "Tenant has leases and cannot be deleted");
  }

  // Mongoose filter typing; cast through any.
  const tenant = await Tenant.findOneAndDelete({ _id: id, orgId } as any);

  if (!tenant) {
    throw AppError.notFound("Tenant not found");
  }
}
