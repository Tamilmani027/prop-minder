import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export interface RentChargeDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  leaseId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  // Snapshot taken at generation time so rent lists need no joins and history
  // stays accurate even if tenant names / unit labels change later.
  tenantName: string;
  unitLabel: string;
  period: string; // "YYYY-MM"
  amountPaise: number;
  dueDate: Date;
  paidPaise: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentChargeModel extends Model<RentChargeDoc> {}

const rentChargeSchema = new mongoose.Schema<RentChargeDoc, RentChargeModel>(
  {
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", required: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    tenantName: { type: String, required: true, trim: true },
    unitLabel: { type: String, required: true, trim: true },
    period: { type: String, required: true },
    amountPaise: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidPaise: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tenantPlugin adds the orgId field (required, indexed) and tenant scoping.
rentChargeSchema.plugin(tenantPlugin);

// UNIQUE per (org, lease, period). This is what makes generation idempotent:
// running generateCharges twice can never create duplicate charges for the same
// lease and period, because the second insert hits this index (code 11000).
rentChargeSchema.index({ orgId: 1, leaseId: 1, period: 1 }, { unique: true });

// Common lookup: all charges for an org in a period, ordered by due date.
rentChargeSchema.index({ orgId: 1, period: 1, dueDate: 1 });

export const RentCharge = mongoose.model<RentChargeDoc, RentChargeModel>(
  "RentCharge",
  rentChargeSchema
);
