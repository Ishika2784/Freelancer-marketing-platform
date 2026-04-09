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
    getJobMatches,
    rateFreelancer
} = require("../controllers/JobControllers");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createJob);
router.get("/", getAllJobs);
router.get("/my", authMiddleware, getMyJobs);
router.get("/my-applications", authMiddleware, getMyApplications);
router.get("/my-proposals", authMiddleware, getMyProposals);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);
router.post("/:id/apply", authMiddleware, applyToJob);
router.get("/:id/applicants", authMiddleware, getApplicants);
router.post("/:id/hire", authMiddleware, hireFreelancer);
router.get("/:id/matches", authMiddleware, getJobMatches);
router.post("/:id/rate", authMiddleware, rateFreelancer);
module.exports = router;