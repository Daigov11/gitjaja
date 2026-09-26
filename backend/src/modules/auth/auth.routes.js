import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "./auth.controller.js";

var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { codResponse: 0, message: "Demasiados intentos de login. Intenta más tarde.", data: [] },
});

export var authRouter = Router();

authRouter.post("/login", loginLimiter, authController.login);
