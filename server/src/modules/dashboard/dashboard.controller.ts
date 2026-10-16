import { Request, Response } from "express";
import { getAuth } from "../../utils/getAuth";
import { getDashboard } from "./dashboard.service";

export const dashboardController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const { orgId } = getAuth(res);
  const { period } = res.locals.validated.query as {
    period?: string;
  };
  const result = await getDashboard(orgId, period);
  res.json({ data: result });
};
