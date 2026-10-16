import mongoose from "mongoose";
import { Property, type PropertyDoc } from "./property.model";
import { Unit } from "../unit/unit.model";
import { paginate, listResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";

// Escape regex metacharacters so a client-supplied search string is treated as
// a literal substring rather than a regex pattern. Without this, input such as
// "(" or ")" would be interpreted as regex syntax, causing unintended matches
// or a thrown "Invalid regular expression" error.
const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export async function createProperty(
  orgId: mongoose.Types.ObjectId,
  input: { name: string; address: string; city?: string }
) {
  const property = await Property.create({
    orgId,
    name: input.name,
    address: input.address,
    city: input.city,
  } as any);
  // Mongoose typed create() doesn't accept a plain object literal with orgId
  // set from a different model instance; cast through any. Return type cast
  // through unknown for the service boundary.
  return property as unknown as PropertyDoc;
}

export async function listProperties(
  orgId: mongoose.Types.ObjectId,
  input: { q?: string; page: number; limit: number }
) {
  const { q } = input;
  const { page, limit, skip } = paginate(input);

  const filter: Record<string, unknown> = { orgId };
  if (q) {
    filter.name = { $regex: escapeRegExp(q), $options: "i" };
  }

  const [data, total] = await Promise.all([
    Property.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Property.countDocuments(filter),
  ]);

  return listResponse(data as unknown as PropertyDoc[], total, page, limit);
}

export async function getProperty(orgId: mongoose.Types.ObjectId, id: string) {
  // Mongoose filter typing doesn't allow mixing a string id with the ObjectId
  // _id field type; cast through any. Same for orgId scoping.
  const property = await Property.findOne({ _id: id, orgId } as any);

  if (!property) {
    throw AppError.notFound("Property not found");
  }

  return property as unknown as PropertyDoc;
}

export async function updateProperty(
  orgId: mongoose.Types.ObjectId,
  id: string,
  input: Partial<{ name: string; address: string; city?: string }>
) {
  // Mongoose filter typing doesn't allow mixing string ids with ObjectId
  // _id field types; cast through any for both the filter and the $set.
  const property = await Property.findOneAndUpdate(
    { _id: id, orgId } as any,
    { $set: input } as any,
    { new: true }
  );

  if (!property) {
    throw AppError.notFound("Property not found");
  }

  return property as unknown as PropertyDoc;
}

export async function deleteProperty(orgId: mongoose.Types.ObjectId, id: string) {
  // Reject deletion if the property still has units in this org.
  // Mongoose filter typing; cast through any.
  const hasUnits = await Unit.exists({ orgId, propertyId: id } as any);
  if (hasUnits) {
    throw new AppError(409, "CONFLICT", "Property has units; delete them first");
  }

  // Mongoose filter typing; cast through any.
  const property = await Property.findOneAndDelete({ _id: id, orgId } as any);

  if (!property) {
    throw AppError.notFound("Property not found");
  }
}
