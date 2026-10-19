import mongoose, { Model } from "mongoose";

export type Plan = "free" | "pro" | "business";

export interface OrganizationDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  plan: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationModel extends Model<OrganizationDoc> {}

const organizationSchema = new mongoose.Schema<OrganizationDoc, OrganizationModel>(
  {
    name: { type: String, required: true, trim: true },
    plan: { type: String, enum: ["free", "pro", "business"], default: "free" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const Organization = mongoose.model<OrganizationDoc, OrganizationModel>(
  "Organization",
  organizationSchema
);
