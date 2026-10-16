import { Request, Response } from "express";
import { getAuth } from "../../utils/getAuth";
import {
  generateCharges,
  listCharges,
  getCharge,
} from "./rent.service";

export const generateController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { period } = res.locals.validated.body as { period: string };
  const result = await generateCharges(orgId, period);
  res.status(200).json({ data: result });
};

export const listController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const query = res.locals.validated.query as {
    period?: string;
    status?: "paid" | "partial" | "overdue" | "pending";
    leaseId?: string;
    tenantId?: string;
    page: number;
    limit: number;
  };
  const result = await listCharges(orgId, query);
  res.json({
    data: result.data,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
};

export const getController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const charge = await getCharge(orgId, id);
  res.json({ data: charge });
};
