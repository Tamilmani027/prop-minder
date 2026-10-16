import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import {
  createLeaseSchema,
  updateLeaseSchema,
  leaseListQuerySchema,
  paramsSchema,
} from "./lease.schema";
import {
  createController,
  listController,
  getController,
  updateController,
  endController,
} from "./lease.controller";

const router = express.Router();

// All lease routes require authentication; every downstream query is scoped to
// the authenticated user's organization via getAuth(res).
router.use(authenticate);

router.post("/", validate({ body: createLeaseSchema }), createController);
router.get("/", validate({ query: leaseListQuerySchema }), listController);
router.get("/:id", validate({ params: paramsSchema }), getController);
router.patch(
  "/:id",
  validate({ params: paramsSchema, body: updateLeaseSchema }),
  updateController
);
router.post("/:id/end", validate({ params: paramsSchema }), endController);

export default router;
