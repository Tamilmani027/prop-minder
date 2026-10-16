import express from "express";
import { validate } from "../../middleware/validate";
import { authenticate } from "../auth/auth.middleware";
import {
  generateSchema,
  chargeListQuerySchema,
  paramsSchema,
} from "./rent.schema";
import {
  generateController,
  listController,
  getController,
} from "./rent.controller";

const router = express.Router();

// All rent routes require authentication; every downstream query is scoped to
// the authenticated user's organization via getAuth(res).
router.use(authenticate);

router.post("/generate", validate({ body: generateSchema }), generateController);
router.get("/charges", validate({ query: chargeListQuerySchema }), listController);
router.get("/charges/:id", validate({ params: paramsSchema }), getController);

export default router;
