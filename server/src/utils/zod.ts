import { z } from 'zod';

// A MongoDB ObjectId is a 24-character hex string. Stored as a string so the
// schema stays simple; converted to Types.ObjectId where needed.
export const objectIdSchema = z.string().length(24, 'Invalid ObjectId');

// Common pagination parameters. Coerced from query strings to numbers, with
// sensible defaults and a cap so a client cannot request an enormous page.
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// A billing/reporting period like "2026-03".
export const periodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be YYYY-MM');
