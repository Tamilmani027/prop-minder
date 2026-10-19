import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export interface UnitDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  label: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitModel extends Model<UnitDoc> {}

const unitSchema = new mongoose.Schema<UnitDoc, UnitModel>(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    label: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tenantPlugin adds the orgId field (required, indexed) and tenant scoping.
unitSchema.plugin(tenantPlugin);

// Stop duplicate unit labels inside a property, scoped to the org.
unitSchema.index({ orgId: 1, propertyId: 1, label: 1 }, { unique: true });

export const Unit = mongoose.model<UnitDoc, UnitModel>("Unit", unitSchema);
