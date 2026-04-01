const User = require('../models/User');

exports.updatePlan = async (req, res) => {
    try {
        const { plan } = req.body;
        const userId = req.user.userId; 

        if (!plan || !['free', 'pro'].includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan specified.' });
        }

        const user = await User.findByIdAndUpdate(userId, { plan }, { returnDocument: 'after'  }).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'User plan updated successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan
            }
        });

    } catch (error) {
        console.error('Error updating user plan:', error);
        res.status(500).json({ message: 'Server error while updating plan.' });
    }
};
