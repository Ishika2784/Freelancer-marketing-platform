const Job = require("../models/Job");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.createJob = async (req, res) => {
    try {
        const { title, description, budget, skills } = req.body;

        if (!title || !description || !budget) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const job = new Job({
            title,
            description,
            budget,
            skills: skills ? skills.split(",") : [], // convert string → array
            client: req.user.userId
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


exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate("client", "name email") // show client info
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

        const { title, description, budget, skills } = req.body;
        if (title) job.title = title;
        if (description) job.description = description;
        if (budget) job.budget = budget;
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

        res.json({ message: "Freelancer hired successfully" });
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

        const job = await Job.findById(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (!job.skills || job.skills.length === 0) {
            return res.json([]); // No skills to match against
        }

        // Fetch all freelancers to provide to Gemini
        const freelancers = await User.find({ role: "freelancer" }).select("name skills hourlyRate");
        
        if (freelancers.length === 0) {
            return res.json({ ai_response: "No freelancers available on the platform yet." });
        }

        // Format the freelancer data for the prompt
        const freelancerList = freelancers.map(f => 
            `Name: ${f.name}\nSkills: ${f.skills.join(", ")}\nHourly Rate: ${f.hourlyRate ? f.hourlyRate + ' INR' : 'Not specified'}`
        ).join("\n\n");

        const prompt = `You are an AI assistant for a freelancer marketplace platform.

Your task is to intelligently match the best freelancers to a given job.

Instructions:
* Carefully understand the job requirements, including title, description, and required skills.
* Compare freelancers based on:
  * Skill relevance
  * Experience (if mentioned)
  * Overall suitability for the job
* Prioritize freelancers whose skills closely match or are related to the job requirements.
* Even if exact keywords do not match, use logical understanding (e.g., MERN = MongoDB, Express, React, Node).
* Return ONLY the top 3 most relevant freelancers.
* Keep explanations short and clear.

Job Details:
Title: ${job.title}
Description: ${job.description}
Required Skills: ${job.skills.join(", ")}

Freelancers:
${freelancerList}

Output format:
1. Name: <freelancer name>
   Skills: <skills>
   Match Score: <High/Medium/Low>
   Reason: <why this freelancer is a good match>

2. Name: <freelancer name>
   Skills: <skills>
   Match Score: <High/Medium/Low>
   Reason: <short explanation>

3. Name: <freelancer name>
   Skills: <skills>
   Match Score: <High/Medium/Low>
   Reason: <short explanation>`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.json({ ai_response: responseText });
    } catch (error) {
        console.error(error);
        if (error.status === 429) {
            return res.status(429).json({ message: "AI quota exceeded. Please try again later or upgrade your Gemini API plan." });
        }
        res.status(500).json({ message: "Error fetching matches" });
    }
};