const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
 
        if (plan !== 'pro') {
            return res.status(400).json({ message: "Invalid plan for order creation." });
        }
        const amount = 29900;

        const options = {
            amount,
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating order" });
    }
};
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        if (expectedSign !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid signature" });
        }

        const userId = req.user.userId;

        const user = await User.findByIdAndUpdate(userId, {
            plan: "pro"
        }, { returnDocument: 'after' }).select('-password');

        if (!user) {
            return res.status(404).json({ message: "User not found, could not update plan." });
        }

        res.json({
            message: "Payment verified & plan updated",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Payment verification failed" });
    }
};