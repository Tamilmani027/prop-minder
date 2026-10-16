import express from "express";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerController, loginController } from "./auth.controller";

const router = express.Router();

router.post("/register", validate({ body: registerSchema }), registerController);
router.post("/login", validate({ body: loginSchema }), loginController);

export default router;
