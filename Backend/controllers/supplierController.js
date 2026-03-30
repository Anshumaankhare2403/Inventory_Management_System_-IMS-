const db = require('../config/db');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res, next) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY created_at DESC');
        res.json(suppliers);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = async (req, res, next) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;

        if (!name) {
            res.status(400);
            throw new Error('Please add a supplier name');
        }

        const [result] = await db.query(
            'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
            [name, contact_person || null, email || null, phone || null, address || null]
        );

        res.status(201).json({ id: result.insertId, name, contact_person, email, phone, address });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private/Admin
const updateSupplier = async (req, res, next) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Supplier not found');
        }

        await db.query(
            'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [
                name || existing[0].name,
                contact_person !== undefined ? contact_person : existing[0].contact_person,
                email !== undefined ? email : existing[0].email,
                phone !== undefined ? phone : existing[0].phone,
                address !== undefined ? address : existing[0].address,
                id
            ]
        );

        res.json({ id, name, contact_person, email, phone, address });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM suppliers WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Supplier not found');
        }

        await db.query('DELETE FROM suppliers WHERE id = ?', [id]);

        res.json({ id });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
