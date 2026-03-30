const db = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            ORDER BY p.created_at DESC
        `;
        const [products] = await db.query(query);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.id = ?
        `;
        const [products] = await db.query(query, [id]);

        if (products.length === 0) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.json(products[0]);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
    try {
        const { name, description, sku, price, cost_price, stock_quantity, category_id, supplier_id } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !price || !cost_price) {
            res.status(400);
            throw new Error('Please add name, price, and cost price');
        }

        const [result] = await db.query(
            `INSERT INTO products 
            (name, description, sku, price, cost_price, stock_quantity, category_id, supplier_id, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, 
                description || null, 
                sku || null, 
                price, 
                cost_price, 
                stock_quantity || 0, 
                category_id || null, 
                supplier_id || null, 
                image_url
            ]
        );

        res.status(201).json({ id: result.insertId, name, price, image_url });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, sku, price, cost_price, stock_quantity, category_id, supplier_id } = req.body;
        
        const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Product not found');
        }

        const image_url = req.file ? `/uploads/${req.file.filename}` : existing[0].image_url;

        await db.query(
            `UPDATE products SET 
            name = ?, description = ?, sku = ?, price = ?, cost_price = ?, 
            stock_quantity = ?, category_id = ?, supplier_id = ?, image_url = ?
            WHERE id = ?`,
            [
                name || existing[0].name,
                description !== undefined ? description : existing[0].description,
                sku !== undefined ? sku : existing[0].sku,
                price || existing[0].price,
                cost_price || existing[0].cost_price,
                stock_quantity !== undefined ? stock_quantity : existing[0].stock_quantity,
                category_id !== undefined ? category_id : existing[0].category_id,
                supplier_id !== undefined ? supplier_id : existing[0].supplier_id,
                image_url,
                id
            ]
        );

        res.json({ id, name, message: 'Product updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        
        if (existing.length === 0) {
            res.status(404);
            throw new Error('Product not found');
        }

        await db.query('DELETE FROM products WHERE id = ?', [id]);

        res.json({ id, message: 'Product deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
