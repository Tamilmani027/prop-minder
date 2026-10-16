import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import { dashboardQuerySchema } from "./dashboard.schema";
import { dashboardController } from "./dashboard.controller";

const router = express.Router();

// All dashboard routes require authentication; every downstream query is
// scoped to the authenticated user's organization via getAuth(res).
router.use(authenticate);

router.get(
  "/",
  validate({ query: dashboardQuerySchema }),
  dashboardController
);

export default router;
