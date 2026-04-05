const db = require('../config/db');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
    try {
        const query = `
            SELECT o.*, u.name as created_by
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `;
        const [orders] = await db.query(query);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        
        if (orders.length === 0) {
            res.status(404);
            throw new Error('Order not found');
        }

        const [items] = await db.query(`
            SELECT oi.*, p.name as product_name, p.sku 
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [id]);

        res.json({
            ...orders[0],
            items
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new order (with transaction)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
    // Expected body: { type: 'Purchase'|'Sales', items: [{ product_id, quantity, unit_price }] }
    // type: 'Purchase' -> Stock IN
    // type: 'Sales' -> Stock OUT
    const { type, items } = req.body;
    
    if (!type || !items || items.length === 0) {
        res.status(400);
        return next(new Error('Please provide order type and items'));
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        let total_amount = 0;

        // Verify products and calculate total
        for (let item of items) {
            const [products] = await connection.query('SELECT stock_quantity, price, name FROM products WHERE id = ?', [item.product_id]);
            
            if (products.length === 0) {
                throw new Error(`Product ID ${item.product_id} not found`);
            }

            const product = products[0];

            if (type === 'Sales' && product.stock_quantity < item.quantity) {
                throw new Error(`Insufficient stock for product: ${product.name}`);
            }

            item.total_price = item.quantity * item.unit_price;
            total_amount += item.total_price;
        }

        // Insert Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, type, status, total_amount) VALUES (?, ?, ?, ?)',
            [req.user.id, type, 'Completed', total_amount]
        );
        const orderId = orderResult.insertId;

        // Process Items
        for (let item of items) {
            // Insert Order Item
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]
            );

            // Stock update and inventory logs are handled via DB Trigger `after_order_item_insert`
        }

        await connection.commit();

        res.status(201).json({ 
            message: 'Order created successfully',
            order_id: orderId,
            total_amount
        });

    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        
        res.json({ id, status, message: 'Status updated' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus
};
