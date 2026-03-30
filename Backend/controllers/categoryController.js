const db = require('../config/db');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.json(categories);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Please add a category name');
        }

        const [result] = await db.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        res.status(201).json({ id: result.insertId, name, description });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Category not found');
        }

        await db.query(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name || existing[0].name, description !== undefined ? description : existing[0].description, id]
        );

        res.json({ id, name, description });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Category not found');
        }

        await db.query('DELETE FROM categories WHERE id = ?', [id]);

        res.json({ id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
