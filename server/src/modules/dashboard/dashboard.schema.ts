import { z } from "zod";
import { periodSchema } from "../../utils/zod";

export const dashboardQuerySchema = z.object({
  period: periodSchema.optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
