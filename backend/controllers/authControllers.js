const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const redis = require ('../utils/redisClient');
const axios = require('axios');
require('dotenv').config();

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }
        
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists. Please login instead.' 
            });
        }
        const cooldown = await redis.get(`cooldown:${email}`);
        if (cooldown) {
            return res.status(429).json({
                message: 'Please wait before requesting another OTP'
            });
        }

        const key = `otp:${email}`;
        
        const otp = Math.floor(100000 + Math.random() * 900000);
        await redis.set(key, otp, 'EX', 30);
        await redis.set(`cooldown:${email}`, 'true', 'EX', 60);

        await axios.post("https://api.brevo.com/v3/smtp/email", {
            sender: { email: "ishika2784@gmail.com" },
            to: [{ email }],
            subject: "Your OTP for verification",
            htmlContent: `<p>Your OTP is: <strong>${otp}</strong></p>`
        }, {
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error) {
        if (error.response) {
            console.error('Brevo API Error:', error.response.data);
        } else {
            console.error('Error sending OTP:', error.message);
        }

        res.status(500).json({ message: 'Failed to send OTP' });
    }
};


exports.verifyOtpForRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required.' });
        }

        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== String(otp)) {
            return res.status(401).json({ message: 'Invalid or expired OTP.' });
        }

        await redis.set(`verified:${email}`, 'true', 'EX', 300);

        res.status(200).json({ message: 'OTP verified successfully. You can now register.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register= async (req, res) => {
    try{
        const { name, email, password, role } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const isVerified = await redis.get(`verified:${email}`);
        if (!isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your OTP first.' });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({ message: 'User already exists. Please login.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'client'
        });

        await newUser.save();
        await redis.del(`otp:${email}`);
        await redis.del(`verified:${email}`);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try{
        const { email, password,role } = req.body;

        if(!email || !password || !role){
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({ message: 'Invalid credentials' });
        } 
        if(user.role !== role){
            return res.status(401).json({ message: 'Invalid credentials for the specified role' });
        }      
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in the environment variables.');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign({ userId: user._id ,role: user.role}, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            message: 'Login successful',
            token,
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
        res.status(500).json({ message: 'Server error' });
    }
    };
exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      hourlyRate: user.hourlyRate,
      yearsOfExperience: user.yearsOfExperience
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.verifyOtp = async (req, res) => {
//     try{
//         const { email, otp, role } = req.body;

//         const storedOtp = await redis.get(`otp:${email}`);

//         if(!storedOtp || storedOtp !== otp){
//             return res.status(401).json({ message: 'Invalid OTP' });
//         }
//         const user = await User.findOne({ email, role });

//         if(!user){
//             return res.status(404).json({ message: 'User not found' });
//         }
//         await redis.del(`otp:${email}`);

//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.secretKey, { expiresIn: '1h' });

//         res.status(200).json({ message: 'OTP verified successfully' 
//             ,token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }

//         });
//     }catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
