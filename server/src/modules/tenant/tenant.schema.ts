import { z } from "zod";
import { objectIdSchema, paginationSchema } from "../../utils/zod";

// An optional ObjectId field: an empty string means "not set" and is normalized
// to undefined before validation so callers can omit it without sending a
// placeholder. objectIdSchema itself stays strict (used for params.id).
const optionalObjectId = z.preprocess(
  (val: unknown) => (val === '' ? undefined : val),
  objectIdSchema.optional(),
);

export const createTenantSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  phone: z.string().trim().min(1, "phone is required"),
  email: z.string().trim().toLowerCase().email("invalid email").optional(),
  notes: z.string().trim().min(1).optional(),
  propertyId: optionalObjectId,
  unitId: optionalObjectId,
  monthlyRent: z.coerce.number().positive("monthly rent must be positive").optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "due date must be YYYY-MM-DD").optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email("invalid email").optional(),
  notes: z.string().trim().min(1).optional(),
  propertyId: optionalObjectId,
  unitId: optionalObjectId,
  monthlyRent: z.coerce.number().positive("monthly rent must be positive").optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "due date must be YYYY-MM-DD").optional(),
});

export const tenantListQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).optional(),
});

export const paramsSchema = z.object({
  id: objectIdSchema,
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantListQuery = z.infer<typeof tenantListQuerySchema>;
export type TenantParams = z.infer<typeof paramsSchema>;
