const db = require('../config/db');
const bcrypt = require('bcrypt');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, name, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const [users] = await db.query('SELECT id, name, username, email, role, created_at FROM users WHERE id = ?', [id]);

        if (users.length === 0) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json(users[0]);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, username, email, role, password } = req.body;
        
        const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('User not found');
        }

        // Handle password update if provided
        let hashedPassword = existing[0].password;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        await db.query(
            'UPDATE users SET name = ?, username = ?, email = ?, role = ?, password = ? WHERE id = ?',
            [
                name || existing[0].name,
                username || existing[0].username,
                email || existing[0].email,
                role || existing[0].role,
                hashedPassword,
                id
            ]
        );

        res.json({ id, name, username, email, role });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id == req.user.id) {
            res.status(400);
            throw new Error('Cannot delete your own account');
        }

        const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('User not found');
        }

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({ id, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
