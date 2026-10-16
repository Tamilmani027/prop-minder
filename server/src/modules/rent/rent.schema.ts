import { z } from "zod";
import { periodSchema, objectIdSchema } from "../../utils/zod";

export const generateSchema = z.object({
  period: periodSchema,
});

export const chargeListQuerySchema = z.object({
  period: periodSchema.optional(),
  status: z.enum(["paid", "partial", "overdue", "pending"]).optional(),
  leaseId: objectIdSchema.optional(),
  tenantId: objectIdSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const paramsSchema = z.object({
  id: objectIdSchema,
});

export type GenerateInput = z.infer<typeof generateSchema>;
export type ChargeListQuery = z.infer<typeof chargeListQuerySchema>;
export type RentChargeParams = z.infer<typeof paramsSchema>;
