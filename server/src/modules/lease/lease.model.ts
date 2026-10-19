import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export type LeaseStatus = "active" | "ended";

export interface LeaseDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  unitId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  rentPaise: number;
  depositPaise: number;
  dueDay: number;
  startDate: Date;
  endDate?: Date;
  status: LeaseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseModel extends Model<LeaseDoc> {}

const leaseSchema = new mongoose.Schema<LeaseDoc, LeaseModel>(
  {
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    rentPaise: { type: Number, required: true, min: 1 },
    depositPaise: { type: Number, default: 0, min: 0 },
    dueDay: { type: Number, required: true, min: 1, max: 28 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "ended"], default: "active" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tenantPlugin adds the orgId field (required, indexed) and tenant scoping.
leaseSchema.plugin(tenantPlugin);

// One active lease per unit, enforced by the database so even simultaneous
// requests can't create two active leases for the same unit.
leaseSchema.index({ orgId: 1, unitId: 1 }, { unique: true, partialFilterExpression: { status: "active" } });

leaseSchema.index({ orgId: 1, tenantId: 1 });
leaseSchema.index({ orgId: 1, status: 1 });

export const Lease = mongoose.model<LeaseDoc, LeaseModel>("Lease", leaseSchema);
