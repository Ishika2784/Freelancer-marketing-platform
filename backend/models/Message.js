const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
}, { timestamps: true });

// Index for fast conversation lookup
messageSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model("Message", messageSchema);
