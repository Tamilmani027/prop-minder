import { z } from "zod";
import { objectIdSchema } from "../../utils/zod";

// Validates the :propertyId URL param used by the nested unit routes
// (/properties/:propertyId/units). Kept separate from unitIdParamsSchema
// because the nested and standalone routes mount this router with mergeParams.
export const propertyIdParamsSchema = z.object({
  propertyId: objectIdSchema,
});

export const createUnitSchema = z.object({
  label: z.string().trim().min(1, "label is required"),
  notes: z.string().trim().min(1).optional(),
});

export const updateUnitSchema = z.object({
  label: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
});

export const unitListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const unitIdParamsSchema = z.object({
  id: objectIdSchema,
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type UnitListQuery = z.infer<typeof unitListQuerySchema>;
export type UnitIdParams = z.infer<typeof unitIdParamsSchema>;
export type PropertyIdParams = z.infer<typeof propertyIdParamsSchema>;
