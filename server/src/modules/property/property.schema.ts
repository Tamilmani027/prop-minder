import { z } from "zod";
import { objectIdSchema } from "../../utils/zod";
import { paginationSchema } from "../../utils/zod";

export const createPropertySchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  address: z.string().trim().min(1, "address is required"),
  city: z.string().trim().min(1).optional(),
});

export const updatePropertySchema = z.object({
  name: z.string().trim().min(1).optional(),
  address: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
});

export const propertyListQuerySchema = paginationSchema.extend({
  q: z.string().trim().min(1).optional(),
});

export const paramsSchema = z.object({
  id: objectIdSchema,
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyListQuery = z.infer<typeof propertyListQuerySchema>;
export type PropertyParams = z.infer<typeof paramsSchema>;
