const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });
};

// @desc    Register a new user (Admin only, or first user setup)
// @route   POST /api/auth/register
// @access  Public/Admin
const registerUser = async (req, res, next) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !username || !email || !password) {
            res.status(400);
            throw new Error('Please add all required fields');
        }

        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existing.length > 0) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Required Role assignment logic
        const assignedRole = role === 'Admin' ? 'Admin' : 'Staff';

        // Create user
        const [result] = await db.query(
            'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [name, username, email, hashedPassword, assignedRole]
        );

        if (result.insertId) {
            res.status(201).json({
                _id: result.insertId,
                name: name,
                username: username,
                email: email,
                role: assignedRole,
                token: generateToken(result.insertId),
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

module.exports = {
    registerUser,
    loginUser,
};
