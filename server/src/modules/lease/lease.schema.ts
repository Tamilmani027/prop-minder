import { z } from "zod";
import { objectIdSchema, paginationSchema } from "../../utils/zod";

// A date string that parses to a valid moment in time.
const dateString = z.string().refine((val) => !isNaN(Date.parse(val)), "invalid date");

// dueDay is capped at 28 because every calendar month has at least 28 days, so
// the due date is always valid regardless of month length.
export const createLeaseSchema = z.object({
  unitId: objectIdSchema,
  tenantId: objectIdSchema,
  rentPaise: z.number().int().positive(),
  depositPaise: z.number().int().nonnegative().default(0),
  dueDay: z.number().int().min(1).max(28),
  startDate: dateString,
  endDate: dateString.optional(),
});

export const updateLeaseSchema = z.object({
  rentPaise: z.number().int().positive().optional(),
  depositPaise: z.number().int().nonnegative().optional(),
  dueDay: z.number().int().min(1).max(28).optional(),
  endDate: dateString.optional(),
});

export const leaseListQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "ended"]).optional(),
  unitId: objectIdSchema.optional(),
  tenantId: objectIdSchema.optional(),
});

export const paramsSchema = z.object({
  id: objectIdSchema,
});

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
export type LeaseListQuery = z.infer<typeof leaseListQuerySchema>;
export type LeaseParams = z.infer<typeof paramsSchema>;
