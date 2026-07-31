import { Router } from "express";
import { validateBody } from "../middlewares/validate-body.middleware.ts";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth.controller.ts";
import { loginSchema, registerSchema } from "../validations/auth.validation.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), registerUser);

authRouter.post("/login", validateBody(loginSchema), loginUser);

authRouter.get("/me", authenticate, getCurrentUser);

authRouter.post("/logout", logoutUser);
