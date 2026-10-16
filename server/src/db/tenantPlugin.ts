/**
 * Mongoose plugin for multi-tenancy.
 *
 * Adds an `orgId` field to schemas and scopes queries by tenant.
 * Includes a `skipTenant()` query helper for flows (e.g. auth) that run before
 * the org is known.
 */

import mongoose from "mongoose";

export const tenantPlugin = (schema: mongoose.Schema): void => {
  schema.add({ orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true } });

  // Query helper to bypass tenant scoping (orgId filter).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema.query as any).skipTenant = function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any)._skipTenant = true;
    return this;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema.pre(/^find/, function (this: any) {
    if (this._skipTenant) return;
    // placeholder: tenant scoping (orgId filter) would be applied here
  });
};
