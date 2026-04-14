const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    skills: [
        {
            type: String
        }
    ],

    // 🔗 who posted the job
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    // 👥 freelancers who applied
    applicants: [
        {
            freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            appliedAt:  { type: Date, default: Date.now },
            status:     { type: String, enum: ["pending", "hired", "rejected"], default: "pending" }
        }
    ],

    status: { type: String, enum: ["open", "in-progress", "completed"], default: "open" },
    type: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deadline: { type: Date, default: null },
    aiMatches: { type: String, default: null }, // cached AI response

    createdAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);