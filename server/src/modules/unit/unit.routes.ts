import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import {
  createUnitSchema,
  updateUnitSchema,
  unitListQuerySchema,
  unitIdParamsSchema,
  propertyIdParamsSchema,
} from "./unit.schema";
import {
  createController,
  listController,
  getController,
  updateController,
  deleteController,
} from "./unit.controller";

const router = express.Router({ mergeParams: true });

// All unit routes require authentication; every downstream query is scoped to
// the authenticated user's organization via getAuth(res). The same router is
// mounted at two shapes: nested under a property
// (/properties/:propertyId/units) and standalone (/units/:id).
router.use(authenticate);

// :propertyId comes from the parent mount via mergeParams and is validated here.
router.post(
  "/",
  validate({ params: propertyIdParamsSchema, body: createUnitSchema }),
  createController
);
router.get(
  "/",
  validate({ params: propertyIdParamsSchema, query: unitListQuerySchema }),
  listController
);
router.get("/:id", validate({ params: unitIdParamsSchema }), getController);
router.patch(
  "/:id",
  validate({ params: unitIdParamsSchema, body: updateUnitSchema }),
  updateController
);
router.delete("/:id", validate({ params: unitIdParamsSchema }), deleteController);

export default router;
