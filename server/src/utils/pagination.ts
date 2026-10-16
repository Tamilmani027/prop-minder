import { objectIdSchema, paginationSchema } from './zod';
import { z } from 'zod';

// Converts { page, limit } into { skip, limit } for Mongoose. page is 1-based.
export type PaginationInput = z.infer<typeof paginationSchema>;

export const paginate = (input: unknown): { page: number; limit: number; skip: number } => {
  const { page, limit } = paginationSchema.parse(input);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Standard shape for list endpoints so every collection response looks the same.
export type ListResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

export const listResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): ListResponse<T> => ({
  data,
  page,
  limit,
  total,
});
