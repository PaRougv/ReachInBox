import { Router } from "express";
import passport from "passport";
import { env } from "../config/env";

export const authRoutes = Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${env.FRONTEND_URL}/login` }),
  (req, res) => res.redirect(`${env.FRONTEND_URL}/dashboard`)
);

authRoutes.get("/me", (req, res) => {
  res.json({ success: true, user: req.user ?? null });
});

authRoutes.post("/logout", (req, res) => {
  req.logout(() => res.json({ success: true }));
});
