const Message  = require("../models/Message");
const User     = require("../models/User");
const Job      = require("../models/Job");
const mongoose = require("mongoose");

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const uid = req.user.userId;
    const oid = new mongoose.Types.ObjectId(uid);
    const convMap = {};

    const user = await User.findById(oid).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build conversation list from hired job relationships (no messages needed)
    if (user.role === "client") {
      const jobs = await Job.find({ client: oid, hiredFreelancer: { $exists: true, $ne: null } })
        .populate("hiredFreelancer", "name email role");
      for (const job of jobs) {
        if (!job.hiredFreelancer) continue;
        const key = job.hiredFreelancer._id.toString();
        if (!convMap[key]) {
          convMap[key] = {
            user: job.hiredFreelancer,
            lastMessage: `Hired for: ${job.title}`,
            lastAt: job.updatedAt || job.createdAt,
            unread: 0,
          };
        }
      }
    } else {
      const jobs = await Job.find({ hiredFreelancer: oid })
        .populate("client", "name email role");
      for (const job of jobs) {
        if (!job.client) continue;
        const key = job.client._id.toString();
        if (!convMap[key]) {
          convMap[key] = {
            user: job.client,
            lastMessage: `Hired for: ${job.title}`,
            lastAt: job.updatedAt || job.createdAt,
            unread: 0,
          };
        }
      }
    }

    // Overlay with actual messages — update lastMessage text and unread count
    const msgs = await Message.find({ $or: [{ from: oid }, { to: oid }] })
      .sort({ createdAt: -1 })
      .populate("from", "name email role")
      .populate("to",   "name email role");

    for (const m of msgs) {
      const other = m.from._id.toString() === uid ? m.to : m.from;
      const key   = other._id.toString();
      if (!convMap[key]) {
        convMap[key] = { user: other, lastMessage: m.text, lastAt: m.createdAt, unread: 0 };
      } else if (new Date(m.createdAt) > new Date(convMap[key].lastAt)) {
        convMap[key].lastMessage = m.text;
        convMap[key].lastAt = m.createdAt;
      }
      if (!m.read && m.to._id.toString() === uid) convMap[key].unread++;
    }

    const result = Object.values(convMap).sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
    res.json(result);
  } catch (e) {
    console.error("getConversations error:", e);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// GET /api/chat/:userId — full message thread with another user
exports.getMessages = async (req, res) => {
  try {
    const me    = req.user.userId;
    const other = req.params.userId;

    const msgs = await Message.find({
      $or: [{ from: me, to: other }, { from: other, to: me }],
    }).sort({ createdAt: 1 }).populate("from", "name _id");

    // Mark incoming messages as read
    await Message.updateMany({ from: other, to: me, read: false }, { read: true });

    res.json(msgs);
  } catch (e) {
    console.error("getMessages error:", e);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// POST /api/chat/:userId — send a message
exports.sendMessage = async (req, res) => {
  try {
    const { text, jobId } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const msg = await Message.create({
      from:  req.user.userId,
      to:    req.params.userId,
      text:  text.trim(),
      jobId: jobId || null,
    });

    const populated = await msg.populate("from", "name _id");

    // Emit real-time event to recipient via Socket.IO
    const emitToUser = req.app.get("emitToUser");
    if (emitToUser) emitToUser(req.params.userId, "new_message", populated);

    res.json(populated);
  } catch (e) {
    console.error("sendMessage error:", e);
    res.status(500).json({ message: "Error sending message" });
  }
};
