import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export interface PropertyDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyModel extends Model<PropertyDoc> {}

const propertySchema = new mongoose.Schema<PropertyDoc, PropertyModel>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, trim: true },
  },
  {
    timestamps: true,
    // Serialize the `id` virtual (the `_id` as a hex string) so clients can
    // read `.id` instead of relying on `_id`.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tenantPlugin adds the orgId field (required, indexed) and tenant scoping.
propertySchema.plugin(tenantPlugin);

// Support lookups within an org by name (e.g. duplicate checks / search).
propertySchema.index({ orgId: 1, name: 1 });

export const Property = mongoose.model<PropertyDoc, PropertyModel>(
  "Property",
  propertySchema
);
