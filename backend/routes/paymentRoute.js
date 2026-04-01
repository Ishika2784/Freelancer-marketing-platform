const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyPayment } = require('../controllers/paymentController');

// This corresponds to the frontend call to /api/payment/createorder
router.post('/createorder', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, verifyPayment);
module.exports = router;