import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyListQuerySchema,
  paramsSchema,
} from "./property.schema";
import {
  createController,
  listController,
  getController,
  updateController,
  deleteController,
} from "./property.controller";

const router = express.Router();

// All property routes require authentication; every downstream query is scoped
// to the authenticated user's organization via getAuth(res).
router.use(authenticate);

router.post("/", validate({ body: createPropertySchema }), createController);
router.get("/", validate({ query: propertyListQuerySchema }), listController);
router.get("/:id", validate({ params: paramsSchema }), getController);
router.patch(
  "/:id",
  validate({ params: paramsSchema, body: updatePropertySchema }),
  updateController
);
router.delete("/:id", validate({ params: paramsSchema }), deleteController);

export default router;
