import { z } from "zod";
import { paginationSchema } from "../../utils/zod";

export const createTenantSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  phone: z.string().trim().min(1, "phone is required"),
  email: z.string().trim().toLowerCase().email("invalid email").optional(),
  notes: z.string().trim().min(1).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().toLowerCase().email("invalid email").optional(),
  notes: z.string().trim().min(1).optional(),
});

export const tenantListQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).optional(),
});

export const paramsSchema = z.object({
  id: z.string().length(24, "Invalid ObjectId"),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantListQuery = z.infer<typeof tenantListQuerySchema>;
export type TenantParams = z.infer<typeof paramsSchema>;
