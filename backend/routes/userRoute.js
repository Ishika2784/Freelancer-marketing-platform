const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');

// This corresponds to the frontend call to /api/user/updateplan
router.post('/updateplan', authMiddleware, userController.updatePlan);

// Get all freelancers (for client dashboard)
router.get('/freelancers', authMiddleware, async (req, res) => {
    try {
        const freelancers = await User.find({ role: 'freelancer' }).select('-password');
        res.json(freelancers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching freelancers" });
    }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, skills, hourlyRate, bio, location, yearsOfExperience } = req.body;
        
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (yearsOfExperience !== undefined) updateData.yearsOfExperience = parseFloat(yearsOfExperience) || 0;

        if (hourlyRate !== undefined) {
            updateData.hourlyRate = parseFloat(hourlyRate) || null;
        }

        if (skills !== undefined) {
            updateData.skills = Array.isArray(skills)
                ? skills
                : skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { returnDocument: 'after' }
        ).select('-password');

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
});

module.exports = router;