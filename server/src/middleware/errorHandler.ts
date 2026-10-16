import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let status = 500;
  let code = 'INTERNAL';
  let message = 'Something went wrong';
  let details: unknown;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request';
    details = Object.values(err.errors).map((e) => ({
      path: String(e.path),
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID';
  } else {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      status = 409;
      code = 'DUPLICATE';
      message = 'Duplicate resource';
    } else {
      const bodyErr = err as { type?: string };
      if (bodyErr.type === 'entity.parse.failed') {
        status = 400;
        code = 'INVALID_JSON';
        message = 'Invalid JSON';
      } else if (bodyErr.type === 'entity.too.large') {
        status = 413;
        code = 'PAYLOAD_TOO_LARGE';
        message = 'Payload too large';
      }
    }
  }

  const isServerError = status >= 500;
  if (isServerError) {
    // Log the real error so we can debug it, but never send it to the client.
    req.log.error(err, 'request failed');
  } else {
    req.log.warn(err, 'request failed');
  }

  // Always send the same shape; never leak the internal message or stack.
  res.status(status).json({
    error: { code, message, details: details ?? null, requestId: req.id },
  });
};
