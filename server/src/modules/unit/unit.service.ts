import mongoose from "mongoose";
import { Unit, type UnitDoc } from "./unit.model";
import { Property } from "../property/property.model";
import { Lease } from "../lease/lease.model";
import { paginate, listResponse } from "../../utils/pagination";
import { AppError } from "../../utils/AppError";
import { objectIdSchema } from "../../utils/zod";

// Validate that a propertyId string from the URL is a real ObjectId.
const parsePropertyId = (value: unknown): mongoose.Types.ObjectId => {
  const parsed = objectIdSchema.safeParse(value);
  if (!parsed.success) {
    throw new AppError(400, "BAD_REQUEST", "Invalid property id");
  }
  return new mongoose.Types.ObjectId(parsed.data);
};

export async function createUnit(
  orgId: mongoose.Types.ObjectId,
  propertyId: mongoose.Types.ObjectId,
  input: { label: string; notes?: string }
) {
  // Verify the property exists in the caller's org before creating a unit.
  const property = await Property.findOne({ _id: propertyId, orgId });
  if (!property) {
    throw AppError.notFound("Property not found");
  }

  try {
    const unit = await Unit.create(
      {
        orgId,
        propertyId,
        label: input.label,
        notes: input.notes,
      } as any
    );
    // Mongoose typed create() doesn't accept a plain object literal; cast
    // through any. Return type cast through unknown for the service boundary.
    return unit as unknown as UnitDoc;
  } catch (error) {
    // Duplicate label within this property (unique index on orgId+propertyId+label).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      throw new AppError(
        409,
        "CONFLICT",
        "Unit label already exists in this property"
      );
    }
    throw error;
  }
}

export async function listUnits(
  orgId: mongoose.Types.ObjectId,
  propertyId: mongoose.Types.ObjectId,
  input: { page: number; limit: number }
) {
  // Verify the property exists in the caller's org before listing units.
  const property = await Property.findOne({ _id: propertyId, orgId });
  if (!property) {
    throw AppError.notFound("Property not found");
  }

  const { page, limit, skip } = paginate(input);

  const [data, total] = await Promise.all([
    Unit.find({ orgId, propertyId }).sort({ label: 1 }).skip(skip).limit(limit),
    Unit.countDocuments({ orgId, propertyId }),
  ]);

  return listResponse(data as unknown as UnitDoc[], total, page, limit);
}

export async function getUnit(
  orgId: mongoose.Types.ObjectId,
  id: string
) {
  const unit = await Unit.findOne({ _id: id, orgId });

  if (!unit) {
    throw AppError.notFound("Unit not found");
  }

  return unit as unknown as UnitDoc;
}

export async function updateUnit(
  orgId: mongoose.Types.ObjectId,
  id: string,
  input: Partial<{ label: string; notes?: string }>
) {
  if (Object.keys(input).length === 0) {
    throw new AppError(400, "BAD_REQUEST", "No fields to update");
  }

  try {
    const unit = await Unit.findOneAndUpdate(
      { _id: id, orgId },
      { $set: input },
      { new: true }
    );

    if (!unit) {
      throw AppError.notFound("Unit not found");
    }

    return unit as unknown as UnitDoc;
  } catch (error) {
    // Duplicate label within this property.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      throw new AppError(
        409,
        "CONFLICT",
        "Unit label already exists in this property"
      );
    }
    throw error;
  }
}

export async function deleteUnit(
  orgId: mongoose.Types.ObjectId,
  id: string
) {
  // Reject deletion if the unit has an active lease.
  // Mongoose filter typing; cast through any.
  const hasActiveLease = await Lease.exists({ orgId, unitId: id, status: "active" } as any);
  if (hasActiveLease) {
    throw new AppError(409, "CONFLICT", "Unit has an active lease");
  }

  // Mongoose filter typing; cast through any.
  const unit = await Unit.findOneAndDelete({ _id: id, orgId } as any);

  if (!unit) {
    throw AppError.notFound("Unit not found");
  }
}
