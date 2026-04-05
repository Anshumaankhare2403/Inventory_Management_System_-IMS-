const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window`
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const { registerUser, loginUser, changePassword } = require('../controllers/authController');
const { protect, protectOptional } = require('../middleware/authMiddleware');

router.post('/register', protectOptional, registerUser);
router.post('/login', loginLimiter, loginUser);
router.put('/change-password', protect, changePassword);

module.exports = router;
