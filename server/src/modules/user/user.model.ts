import mongoose, { Model } from "mongoose";
import { tenantPlugin } from "../../db/tenantPlugin";

export type UserRole = "owner" | "manager";

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserModel extends Model<UserDoc> {}

const userSchema = new mongoose.Schema<UserDoc, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "manager"], default: "owner" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Global unique index on email. Login happens before the org is known, so the lookup
// must work across all tenants/orgs rather than within a single org's scope.
userSchema.index({ email: 1 }, { unique: true });

// tenantPlugin adds the orgId field (tenant scoping) and a skipTenant query helper.
userSchema.plugin(tenantPlugin);

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
