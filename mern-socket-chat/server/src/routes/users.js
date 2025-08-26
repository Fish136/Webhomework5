import express from "express";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  const me = await User.findById(req.user.id).lean();
  res.json({ id: me._id, username: me.username, email: me.email, lastOnlineAt: me.lastOnlineAt });
});

router.get("/online", authMiddleware, async (_req, res) => {
  res.json({ ok: true });
});

export default router;
