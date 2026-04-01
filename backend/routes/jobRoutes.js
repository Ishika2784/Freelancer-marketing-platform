const express = require("express");
const router = express.Router();

const {
    createJob,
    getAllJobs,
    getMyJobs,
    updateJob,
    deleteJob,
    hireFreelancer,
    getMyApplications,
    getMyProposals,
    applyToJob,
    getApplicants,
    getJobMatches
} = require("../controllers/JobControllers");

const authMiddleware = require("../middlewares/authMiddleware");

// POST job
router.post("/", authMiddleware, createJob);

// GET all jobs (freelancer)
router.get("/", getAllJobs);

// GET my jobs (client)
router.get("/my", authMiddleware, getMyJobs);

// GET jobs the freelancer has applied to
router.get("/my-applications", authMiddleware, getMyApplications);

// GET freelancer's proposals with status
router.get("/my-proposals", authMiddleware, getMyProposals);

// PUT update a job (client)
router.put("/:id", authMiddleware, updateJob);

// DELETE a job (client)
router.delete("/:id", authMiddleware, deleteJob);

// POST apply to a job (freelancer)
router.post("/:id/apply", authMiddleware, applyToJob);

// GET applicants for a job (client)
router.get("/:id/applicants", authMiddleware, getApplicants);

// POST hire a freelancer (client)
router.post("/:id/hire", authMiddleware, hireFreelancer);

// GET matches for a job
router.get("/:id/matches", authMiddleware, getJobMatches);

module.exports = router;