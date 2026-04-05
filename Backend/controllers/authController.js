const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

// @desc    Register a new user (Admin or Staff)
// @route   POST /api/auth/register
// @access  Private (Public for first user)
const registerUser = async (req, res, next) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email || !password) {
            res.status(400);
            throw new Error('Please add all required fields');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Please enter a valid email');
        }

        if (password.length < 6) {
            res.status(400);
            throw new Error('Password must be at least 6 characters long');
        }

        // Basic XSS Santization
        const sanitizedName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const sanitizedUsername = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            res.status(400);
            throw new Error('User already exists with that email or username');
        }

        // Determine if this is the first user ever
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const isFirstUser = totalUsers[0].count === 0;

        let assignedRole = 'Staff';
        
        if (isFirstUser) {
            assignedRole = 'Admin';
        } else {
            // If not first user, require authentication
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, please login to register users');
            }
            
            // Only Admin can create Admin
            if (req.user.role === 'Admin' && role === 'Admin') {
                assignedRole = 'Admin';
            } else {
                assignedRole = 'Staff';
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [sanitizedName, sanitizedUsername, email, hashedPassword, assignedRole]
        );

        if (result.insertId) {
            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    _id: result.insertId,
                    name: name,
                    username: username,
                    email: email,
                    role: assignedRole
                }
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const [users] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, email]);

        if (users.length === 0) {
            res.status(401);
            throw new Error('Invalid credentials');
        }

        const user = users[0];

        // Check password
        if (await bcrypt.compare(password, user.password)) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            res.status(400);
            throw new Error('Please provide both old and new passwords');
        }

        if (oldPassword === newPassword) {
            res.status(400);
            throw new Error('New password cannot be the same as the old password');
        }

        if (newPassword.length < 6) {
            res.status(400);
            throw new Error('New password must be at least 6 characters long');
        }

        // Get user from DB
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            res.status(404);
            throw new Error('User not found');
        }

        const user = users[0];

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(401);
            throw new Error('Incorrect old password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    changePassword,
};
