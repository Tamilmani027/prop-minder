import { Request, Response } from "express";
import mongoose from "mongoose";
import { AppError } from "../../utils/AppError";
import { getAuth } from "../../utils/getAuth";
import {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
} from "./unit.service";
import type { PropertyIdParams } from "./unit.schema";

// Reads :propertyId from res.locals.validated.params (set by the Zod
// propertyIdParamsSchema middleware) instead of raw req.params.
const propertyIdFromValidated = (
  params: PropertyIdParams
): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(params.propertyId);
};

export const createController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orgId } = getAuth(res);
  const propertyId = propertyIdFromValidated(
    res.locals.validated.params as PropertyIdParams
  );
  const input = res.locals.validated.body as {
    label: string;
    notes?: string;
  };
  const unit = await createUnit(orgId, propertyId, input);
  res.status(201).json({ data: unit });
};

export const listController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orgId } = getAuth(res);
  const propertyId = propertyIdFromValidated(
    res.locals.validated.params as PropertyIdParams
  );
  const query = res.locals.validated.query as {
    page: number;
    limit: number;
  };
  const result = await listUnits(orgId, propertyId, query);
  res.json({ data: result.data, page: result.page, limit: result.limit, total: result.total });
};

export const getController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const unit = await getUnit(orgId, id);
  res.json({ data: unit });
};

export const updateController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const input = res.locals.validated.body as Partial<{
    label: string;
    notes?: string;
  }>;

  if (Object.keys(input).length === 0) {
    throw new AppError(400, "BAD_REQUEST", "No fields to update");
  }

  const unit = await updateUnit(orgId, id, input);
  res.json({ data: unit });
};

export const deleteController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  await deleteUnit(orgId, id);
  res.status(204).end();
};
