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

// Get notifications for logged-in user
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('notifications');
        if (!user) return res.status(404).json({ message: "User not found" });
        const sorted = [...(user.notifications || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(sorted);
    } catch (e) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
});

// Mark all notifications as read
router.post('/notifications/read', authMiddleware, async (req, res) => {
    try {
        await User.updateOne(
            { _id: req.user.userId },
            { $set: { "notifications.$[].read": true } }
        );
        res.json({ message: "Marked as read" });
    } catch (e) {
        res.status(500).json({ message: "Error marking notifications" });
    }
});

// Get public profile of any user by id
router.get('/profile/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -notifications');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (e) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});

module.exports = router;