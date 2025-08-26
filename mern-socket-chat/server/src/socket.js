import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { encrypt } from "./utils/crypto.js";

// In-memory presence and simple rate-limits
const onlineUsers = new Map(); // userId -> { username, sockets: Set<socketId>, lastSeen }
const roomTyping = new Map();  // room -> Set<userId>
const rateState = new Map();   // socketId -> { tokens, last }

function tokenBucket(socketId, cost = 1, rate = 5, intervalMs = 3000, burst = 8) {
  const now = Date.now();
  const state = rateState.get(socketId) || { tokens: burst, last: now };
  const elapsed = now - state.last;
  const refill = (elapsed / intervalMs) * rate;
  state.tokens = Math.min(burst, state.tokens + refill);
  state.last = now;
  if (state.tokens >= cost) {
    state.tokens -= cost;
    rateState.set(socketId, state);
    return true;
  }
  return false;
}

function dmRoomId(a, b) {
  return ["dm", ...[a, b].sort()].join(":");
}

export function attachSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Unauthorized"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, username: payload.username };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const { id: userId, username } = socket.user;

    // presence
    const entry = onlineUsers.get(userId) || { username, sockets: new Set(), lastSeen: new Date() };
    entry.sockets.add(socket.id);
    onlineUsers.set(userId, entry);
    io.emit("presence:update", Array.from(onlineUsers, ([id, v]) => ({ id, username: v.username })));

    socket.on("room:join", (room) => {
      if (typeof room !== "string" || room.length > 100) return;
      socket.join(room);
      socket.to(room).emit("system", { type: "join", userId, username });
    });

    socket.on("room:leave", (room) => {
      socket.leave(room);
      socket.to(room).emit("system", { type: "leave", userId, username });
    });

    socket.on("typing", ({ room, isTyping }) => {
      if (!room) return;
      const set = roomTyping.get(room) || new Set();
      if (isTyping) set.add(userId); else set.delete(userId);
      roomTyping.set(room, set);
      socket.to(room).emit("typing:update", Array.from(set));
    });

    socket.on("message:send", async (payload, cb) => {
      try {
        if (!tokenBucket(socket.id)) return cb?.({ ok: false, error: "Rate limited" });
        const { room, content, kind = "text", toUserId } = payload || {};
        if (!content || (!room && !toUserId)) return cb?.({ ok: false, error: "Invalid payload" });

        const safeContent = content.toString().slice(0, 5000);
        const finalRoom = toUserId ? dmRoomId(userId, toUserId) : room;

        const enc = encrypt(safeContent);
        const msg = await Message.create({
          content: enc.ciphertext,
          iv: enc.iv,
          tag: enc.tag,
          enc: enc.enc,
          sender: userId,
          room: finalRoom,
          timestamp: new Date()
        });

        const out = {
          id: msg._id,
          room: finalRoom,
          content: safeContent,
          kind,
          timestamp: msg.timestamp,
          sender: { id: userId, username }
        };
        io.to(finalRoom).emit("message:new", out);
        cb?.({ ok: true, message: out });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    socket.on("disconnect", async () => {
      const ent = onlineUsers.get(userId);
      if (ent) {
        ent.sockets.delete(socket.id);
        ent.lastSeen = new Date();
        if (ent.sockets.size === 0) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { lastOnlineAt: ent.lastSeen }).exec();
        } else {
          onlineUsers.set(userId, ent);
        }
      }
      io.emit("presence:update", Array.from(onlineUsers, ([id, v]) => ({ id, username: v.username })));
    });
  });
}
