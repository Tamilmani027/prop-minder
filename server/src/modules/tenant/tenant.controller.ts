import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { getAuth } from "../../utils/getAuth";
import {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
} from "./tenant.service";

export const createController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const input = res.locals.validated.body as {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    propertyId?: string;
    unitId?: string;
    monthlyRent?: number;
    dueDate?: string;
  };
  const tenant = await createTenant(orgId, input);
  res.status(201).json({ data: tenant });
};

export const listController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const query = res.locals.validated.query as {
    q?: string;
    page: number;
    limit: number;
  };
  const result = await listTenants(orgId, query);
  res.json({ data: result.data, page: result.page, limit: result.limit, total: result.total });
};

export const getController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const tenant = await getTenant(orgId, id);
  res.json({ data: tenant });
};

export const updateController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const input = res.locals.validated.body as Partial<{
    name: string;
    phone: string;
    email?: string;
    notes?: string;
  }>;

  if (Object.keys(input).length === 0) {
    throw new AppError(400, "BAD_REQUEST", "No fields to update");
  }

  const tenant = await updateTenant(orgId, id, input);
  res.json({ data: tenant });
};

export const deleteController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  await deleteTenant(orgId, id);
  res.status(204).end();
};
