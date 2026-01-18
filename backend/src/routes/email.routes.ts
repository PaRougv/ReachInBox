import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  bulkScheduleController,
  getScheduledEmails,
  getSentEmails,
  scheduleEmailController
} from "../controllers/email.controller";

export const emailRoutes = Router();

emailRoutes.post("/schedule", requireAuth, scheduleEmailController);
emailRoutes.post("/bulk-schedule", requireAuth, bulkScheduleController);

emailRoutes.get("/scheduled", requireAuth, getScheduledEmails);
emailRoutes.get("/sent", requireAuth, getSentEmails);
