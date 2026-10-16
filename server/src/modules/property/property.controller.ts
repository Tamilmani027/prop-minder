import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { getAuth } from "../../utils/getAuth";
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
} from "./property.service";

export const createController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const input = res.locals.validated.body as {
    name: string;
    address: string;
    city?: string;
  };
  const property = await createProperty(orgId, input);
  res.status(201).json({ data: property });
};

export const listController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const query = res.locals.validated.query as {
    q?: string;
    page: number;
    limit: number;
  };
  const result = await listProperties(orgId, query);
  res.json({ data: result.data, page: result.page, limit: result.limit, total: result.total });
};

export const getController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const property = await getProperty(orgId, id);
  res.json({ data: property });
};

export const updateController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const input = res.locals.validated.body as Partial<{
    name: string;
    address: string;
    city?: string;
  }>;

  if (Object.keys(input).length === 0) {
    throw new AppError(400, "BAD_REQUEST", "No fields to update");
  }

  const property = await updateProperty(orgId, id, input);
  res.json({ data: property });
};

export const deleteController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  await deleteProperty(orgId, id);
  res.status(204).end();
};
