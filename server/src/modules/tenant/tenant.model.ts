import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export interface TenantDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  propertyId?: mongoose.Types.ObjectId;
  unitId?: mongoose.Types.ObjectId;
  monthlyRent?: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantModel extends Model<TenantDoc> {}

const tenantSchema = new mongoose.Schema<TenantDoc, TenantModel>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    notes: { type: String, trim: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
    monthlyRent: { type: Number },
    dueDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tenantPlugin adds the orgId field (required, indexed) and tenant scoping.
tenantSchema.plugin(tenantPlugin);

// Support lookups within an org by name.
tenantSchema.index({ orgId: 1, name: 1 });

export const Tenant = mongoose.model<TenantDoc, TenantModel>("Tenant", tenantSchema);
