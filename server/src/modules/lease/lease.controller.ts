import { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { getAuth } from "../../utils/getAuth";
import {
  createLease,
  endLease,
  getLease,
  listLeases,
  updateLease,
} from "./lease.service";

export const createController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const input = res.locals.validated.body as {
    unitId: string;
    tenantId: string;
    rentPaise: number;
    depositPaise: number;
    dueDay: number;
    startDate: string;
    endDate?: string;
  };
  const lease = await createLease(orgId, input);
  res.status(201).json({ data: lease });
};

export const listController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const query = res.locals.validated.query as {
    status?: "active" | "ended";
    unitId?: string;
    tenantId?: string;
    page: number;
    limit: number;
  };
  const result = await listLeases(orgId, query);
  res.json({ data: result.data, page: result.page, limit: result.limit, total: result.total });
};

export const getController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const lease = await getLease(orgId, id);
  res.json({ data: lease });
};

export const updateController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const input = res.locals.validated.body as Partial<{
    rentPaise: number;
    depositPaise: number;
    dueDay: number;
    endDate: string;
  }>;
  const lease = await updateLease(orgId, id, input);
  res.json({ data: lease });
};

export const endController = async (_req: Request, res: Response) => {
  const { orgId } = getAuth(res);
  const { id } = res.locals.validated.params as { id: string };
  const lease = await endLease(orgId, id);
  res.json({ data: lease });
};
