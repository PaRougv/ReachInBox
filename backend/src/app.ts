import express from "express";
import "express-async-errors";
import cors from "cors";
import session from "express-session";
import passport from "passport";

import { env } from "./config/env";
import "./auth/passport";
import "./queues/email.worker.queue";

import { authRoutes } from "./routes/auth.routes";
import { emailRoutes } from "./routes/email.routes";
import { senderRoutes } from "./routes/sender.routes";
import { authLocalRoutes } from "./routes/auth.local.routes";

const app = express();

app.use(express.json());

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true
}));

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/emails", emailRoutes);
app.use("/senders", senderRoutes);
app.use("/auth/local", authLocalRoutes);

export default app;