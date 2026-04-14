const Job = require("../models/Job");
const User = require("../models/User");
const Message = require("../models/Message");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const redis = require("../utils/redisClient");

exports.createJob = async (req, res) => {
    try {
        const { title, description, budget, skills, deadline, type } = req.body;

        if (!title || !description || !budget) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const job = new Job({
            title, description, budget,
            type: type || "fixed",
            skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [],
            client: req.user.userId,
            deadline: deadline ? new Date(deadline) : null
        });

        await job.save();

        res.status(201).json({
            message: "Job created successfully",
            job
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getAllJobs = async (req, res) => {//freelancer dashboard
    try {
        const jobs = await Job.find()
            .populate("client", "name email")
            .sort({ createdAt: -1 });

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ message: "Error fetching jobs" });
    }
};


exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ client: req.user.userId });

        res.json(jobs);

    } catch (error) {
        res.status(500).json({ message: "Error fetching your jobs" });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, client: req.user.userId });
        if (!job) return res.status(404).json({ message: "Job not found" });

        const { title, description, budget, skills, type } = req.body;
        if (title) job.title = title;
        if (description) job.description = description;
        if (budget) job.budget = budget;
        if (type) job.type = type;
        if (skills !== undefined) job.skills = typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : skills;

        await job.save();
        res.json({ message: "Job updated", job });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, client: req.user.userId });
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.hireFreelancer = async (req, res) => {
    try {
        const { freelancerId } = req.body;
        const job = await Job.findOne({ _id: req.params.id, client: req.user.userId });
        if (!job) return res.status(404).json({ message: "Job not found" });

        const applicant = job.applicants.find(a => a.freelancer.toString() === freelancerId);
        if (!applicant) return res.status(404).json({ message: "Applicant not found" });

        // Mark hired applicant, reject others
        job.applicants.forEach(a => {
            a.status = a.freelancer.toString() === freelancerId ? "hired" : "rejected";
        });
        job.hiredFreelancer = freelancerId;
        job.status = "in-progress";
        await job.save();

        // Push notification to hired freelancer
        await User.findByIdAndUpdate(freelancerId, {
            $push: {
                notifications: {
                    message: `🎉 You've been hired for "${job.title}"! The client is ready to start.`,
                    type: "hired",
                    read: false,
                    jobId: job._id,
                    fromUser: req.user.userId,
                    createdAt: new Date()
                }
            }
        });

        // Auto-send first message to open the conversation on both sides
        const client = await User.findById(req.user.userId).select("name");
        const firstMsg = await Message.create({
            from: req.user.userId,
            to: freelancerId,
            text: `Hi! 👋 I've hired you for "${job.title}". Looking forward to working with you! Let's get started.`,
            jobId: job._id,
        });

        // Emit real-time to freelancer if online
        const emitToUser = req.app.get("emitToUser");
        if (emitToUser) {
            const populated = await firstMsg.populate("from", "name _id");
            emitToUser(freelancerId, "new_message", populated);
        }

        res.json({ message: "Freelancer hired successfully", freelancerId });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const jobs = await Job.find({ "applicants.freelancer": req.user.userId }).select("_id");
        res.json(jobs.map(j => j._id.toString()));
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMyProposals = async (req, res) => {
    try {
        const jobs = await Job.find({ "applicants.freelancer": req.user.userId });
        const result = jobs.map(j => {
            const applicant = j.applicants.find(a => a.freelancer.toString() === req.user.userId);
            return {
                jobId: j._id,
                title: j.title,
                description: j.description,
                budget: j.budget,
                skills: j.skills,
                status: applicant?.status || "pending",
                appliedAt: applicant?.appliedAt
            };
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const alreadyApplied = job.applicants.some(
            a => a.freelancer.toString() === req.user.userId
        );
        if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

        job.applicants.push({ freelancer: req.user.userId });
        await job.save();

        // Clear the AI match cache so this new applicant can be considered
        try {
            await redis.del(`ai_matches:${job._id}`);
        } catch (err) {
            console.error("Redis cache invalidation error:", err);
        }

        res.json({ message: "Applied successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate("applicants.freelancer", "name email skills hourlyRate");

        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.client.toString() !== req.user.userId)
            return res.status(403).json({ message: "Not authorized" });

        res.json(job.applicants);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getJobMatches = async (req, res) => {
    try {
        const clientUser = await User.findById(req.user.userId);
        if (!clientUser || clientUser.plan !== 'pro') {
            return res.status(403).json({ message: "AI matching is only available for Pro plan users." });
        }

        const job = await Job.findById(req.params.id).populate("applicants.freelancer", "name skills hourlyRate");
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (!job.skills || job.skills.length === 0) {
            return res.json([]); // No skills to match against
        }

        // --- REDIS CACHING LOGIC ---
        // Check if a recent, cached result exists in Redis
        const cacheKey = `ai_matches:${job._id}`;
        try {
            const cachedMatch = await redis.get(cacheKey);
            // Ignore cache if the request specifically asks to refresh
            if (cachedMatch && req.query.refresh !== 'true') {
                console.log(`[Cache Hit] Serving old AI matches from Redis for job: ${job._id}`);
                return res.json({ ai_response: cachedMatch, from_cache: true });
            }
        } catch (err) {
            console.error("Redis cache error:", err);
        }

        // Extract freelancers from job applicants
        const freelancers = job.applicants
            .map(a => a.freelancer)
            .filter(Boolean); // Filters out any null/undefined values
        
        if (freelancers.length === 0) {
            return res.json({ ai_response: "No freelancers have applied to this job yet.", from_cache: false });
        }

        // Format the freelancer data for the prompt
        const freelancerList = freelancers.map(f => 
            `Name: ${f.name}\nSkills: ${f.skills ? f.skills.join(", ") : "Not specified"}\nHourly Rate: ${f.hourlyRate ? f.hourlyRate + ' INR' : 'Not specified'}`
        ).join("\n\n");

        const prompt = `You are an expert technical recruiter AI for a freelancer marketplace.

Your task: Rank the TOP 3 freelancers best suited for this job.

Ranking Rules (apply in this order):
1. SKILL MATCH — Does the freelancer cover the required skills? Apply these equivalences:
   - "React" implies knowledge of HTML, CSS, JavaScript
   - "MERN" implies MongoDB, Express, React, Node.js
   - "Full Stack" implies both frontend and backend skills
   - Treat related/superset skills as a match (e.g. React covers html+css+js)
2. BUDGET FIT — The job budget is ${job.budget} INR (fixed price). Estimate project hours as budget/hourly_rate. Prefer freelancers whose hourly rate results in a cost WITHIN or CLOSE TO the budget. Lower rate with full skill match = better value = rank higher.
3. COMPLETENESS — Freelancer who covers MORE of the required skills ranks higher than one who covers fewer, even at a higher rate.

Important:
- A freelancer with React skill automatically satisfies html, css, javascript requirements.
- Rank by: (skill coverage score) first, then (budget efficiency) as tiebreaker.
- Do NOT rank a higher-rate freelancer above a lower-rate one if both have equal skill coverage.

Job Details:
Title: ${job.title}
Description: ${job.description}
Budget: ${job.budget} INR
Required Skills: ${job.skills.join(", ")}

Freelancers:
${freelancerList}

Output format (strictly follow this):
1. Name: <name>
   Skills: <their skills>
   Hourly Rate: <rate>
   Match Score: High / Medium / Low
   Reason: <explain skill coverage and why their rate is good/bad value for the ${job.budget} budget>

2. Name: <name>
   Skills: <their skills>
   Hourly Rate: <rate>
   Match Score: High / Medium / Low
   Reason: <explanation>

3. Name: <name>
   Skills: <their skills>
   Hourly Rate: <rate>
   Match Score: High / Medium / Low
   Reason: <explanation>`

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Save the new response to Redis for caching (expires in 24 hours = 86400s)
        try {
            await redis.set(cacheKey, responseText, 'EX', 86400);
        } catch (err) {
            console.error("Redis save error:", err);
        }

        res.json({ ai_response: responseText, from_cache: false });
    } catch (error) {
        console.error(error);
        if (error.status === 429) {
            return res.status(429).json({ message: "AI quota exceeded. Please try again later or upgrade your Gemini API plan." });
        }
        if (error.status === 404) {
            return res.status(404).json({ message: "AI model not available in your region. Please check your Google AI account." });
        }
        res.status(500).json({ message: "Error fetching matches" });
    }
};

exports.rateFreelancer = async (req, res) => {
    try {
        const { freelancerId, rating } = req.body;
        const job = await Job.findOne({ _id: req.params.id, client: req.user.userId });
        if (!job) return res.status(404).json({ message: "Job not found" });

        job.status = "completed";
        await job.save();

        const freelancer = await User.findById(freelancerId);
        if (freelancer) {
            const currentRating = freelancer.rating || 0;
            const count = freelancer.ratingCount || 0;
            freelancer.rating = ((currentRating * count) + Number(rating)) / (count + 1);
            freelancer.ratingCount = count + 1;
            await freelancer.save();
        }

        res.json({ message: "Freelancer rated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
