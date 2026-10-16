import { Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from './AppError';

// Returns the authenticated user's id and orgId, which middleware stores on
// res.locals.auth after verifying the JWT. Throws 401 if missing so a
// forgotten auth check fails closed instead of returning anonymous data.
export const getAuth = (res: Response): { userId: string; orgId: mongoose.Types.ObjectId } => {
  const auth = res.locals.auth;
  if (!auth || !auth.userId || !auth.orgId) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }
  return { userId: auth.userId as string, orgId: auth.orgId as mongoose.Types.ObjectId };
};
