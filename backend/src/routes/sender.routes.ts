import { Router } from "express";
import { createEtherealSender, listSenders } from "../controllers/sender.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const senderRoutes = Router();

// auth protected
senderRoutes.get("/", requireAuth, listSenders);
senderRoutes.post("/create-ethereal", requireAuth, createEtherealSender);
