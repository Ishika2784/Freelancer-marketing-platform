const express= require('express');
const router = express.Router();

const { getMe, register, login, sendOtp, verifyOtpForRegister} = require('../controllers/authControllers');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp-for-register', verifyOtpForRegister);
router.get('/me', authMiddleware, getMe);

module.exports = router;