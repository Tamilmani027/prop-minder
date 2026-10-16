import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type ValidatedSource = 'body' | 'query' | 'params';

interface ValidateInput {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

interface Issue {
  where: ValidatedSource;
  path: string;
  message: string;
}

export const validate =
  (input: ValidateInput) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const issues: Issue[] = [];
    const parsed: Partial<Record<ValidatedSource, unknown>> = {};

    const run = (source: ValidatedSource, schema: ZodSchema, data: unknown): void => {
      const result = schema.safeParse(data);
      if (!result.success) {
        // Collect every issue so the client can fix all of them at once.
        for (const issue of result.error.issues) {
          issues.push({
            where: source,
            path: issue.path.join('.'),
            message: issue.message,
          });
        }
      } else {
        parsed[source] = result.data;
      }
    };

    if (input.body) {
      run('body', input.body, req.body);
    }
    if (input.query) {
      // req.query is read-only in Express 5, so we only read it here.
      run('query', input.query, req.query);
    }
    if (input.params) {
      run('params', input.params, req.params);
    }

    if (issues.length > 0) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request', issues));
      return;
    }

    // Store parsed data under res.locals.validated. Unknown keys are stripped by
    // Zod by default, so clients cannot inject unexpected fields.
    res.locals.validated = res.locals.validated ?? {};
    if (input.body) {
      res.locals.validated.body = parsed.body;
    }
    if (input.query) {
      res.locals.validated.query = parsed.query;
    }
    if (input.params) {
      res.locals.validated.params = parsed.params;
    }

    next();
  };
