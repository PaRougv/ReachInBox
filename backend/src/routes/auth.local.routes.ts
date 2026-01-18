import { Router } from "express";
import { loginLocal, registerLocal } from "../controllers/auth.local.controller";

export const authLocalRoutes = Router();

authLocalRoutes.post("/register", registerLocal);
authLocalRoutes.post("/login", loginLocal);
