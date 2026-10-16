import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import {
  createTenantSchema,
  updateTenantSchema,
  tenantListQuerySchema,
  paramsSchema,
} from "./tenant.schema";
import {
  createController,
  listController,
  getController,
  updateController,
  deleteController,
} from "./tenant.controller";

const router = express.Router();

// All tenant routes require authentication; every downstream query is scoped to
// the authenticated user's organization via getAuth(res).
router.use(authenticate);

router.post("/", validate({ body: createTenantSchema }), createController);
router.get("/", validate({ query: tenantListQuerySchema }), listController);
router.get("/:id", validate({ params: paramsSchema }), getController);
router.patch(
  "/:id",
  validate({ params: paramsSchema, body: updateTenantSchema }),
  updateController
);
router.delete("/:id", validate({ params: paramsSchema }), deleteController);

export default router;
