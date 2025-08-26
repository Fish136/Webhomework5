import express from "express";
import xss from "xss";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/auth.js";
import { decrypt } from "../utils/crypto.js";

const router = express.Router();

// fetch message history for a room (rooms and DMs)
router.get("/:room", authMiddleware, async (req, res) => {
  const { room } = req.params;
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const messages = await Message.find({ room }).sort({ timestamp: -1 }).limit(limit).populate("sender", "username").lean();
  const cleaned = messages.map(m => ({
    id: m._id,
    content: m.enc ? decrypt({ ciphertext: m.content, iv: m.iv, tag: m.tag }) : m.content,
    sender: { id: m.sender._id, username: m.sender.username },
    room: m.room,
    timestamp: m.timestamp
  })).reverse();
  res.json(cleaned);
});

export default router;
