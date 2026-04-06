const db = require('../config/db');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
    try {
        // 1. Total Products
        const [[{ total_products }]] = await db.query('SELECT COUNT(*) as total_products FROM products');
        
        // 2. Total Categories
        const [[{ total_categories }]] = await db.query('SELECT COUNT(*) as total_categories FROM categories');
        
        // 3. Total Suppliers
        const [[{ total_suppliers }]] = await db.query('SELECT COUNT(*) as total_suppliers FROM suppliers');
        
        // 4. Total Expected Revenue (assuming total_amount from Sales orders)
        const [[{ total_revenue }]] = await db.query('SELECT SUM(total_amount) as total_revenue FROM orders WHERE type = "Sales" AND status != "Canceled"');
        
        // 5. Total Purchases Cost
        const [[{ total_cost }]] = await db.query('SELECT SUM(total_amount) as total_cost FROM orders WHERE type = "Purchase" AND status != "Canceled"');
        
        // 6. Low stock products count (arbitrarily under 10)
        const [[{ low_stock_count }]] = await db.query('SELECT COUNT(*) as low_stock_count FROM products WHERE stock_quantity < 10');

        res.json({
            totalProducts: total_products || 0,
            totalCategories: total_categories || 0,
            totalSuppliers: total_suppliers || 0,
            totalRevenue: total_revenue || 0,
            totalCost: total_cost || 0,
            lowStockCount: low_stock_count || 0,
            netProfit: (total_revenue || 0) - (total_cost || 0)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get low stock products list
// @route   GET /api/dashboard/low-stock
// @access  Private/Admin
const getLowStockProducts = async (req, res, next) => {
    try {
        const LOW_STOCK_THRESHOLD = 10;
        
        const [products] = await db.query(
            'SELECT id, name, sku, stock_quantity, price FROM products WHERE stock_quantity < ? ORDER BY stock_quantity ASC', 
            [LOW_STOCK_THRESHOLD]
        );

        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats for Staff
// @route   GET /api/dashboard/staff
// @access  Private/Staff
const getStaffStats = async (req, res, next) => {
    try {
        // Staff Dashboard stats
        const [[{ assigned_products }]] = await db.query('SELECT COUNT(*) as assigned_products FROM products WHERE assigned_to IS NOT NULL AND status != "Available"');
        
        const [[{ available_products }]] = await db.query('SELECT COUNT(*) as available_products FROM products WHERE status = "Available"');
        
        const [[{ maintenance_products }]] = await db.query('SELECT COUNT(*) as maintenance_products FROM products WHERE status = "Maintenance"');

        // Can also fetch a small array of assigned items here, or handle via normal GET /api/products
        res.json({
            assignedProducts: assigned_products || 0,
            availableProducts: available_products || 0,
            maintenanceProducts: maintenance_products || 0
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDashboardStats,
    getLowStockProducts,
    getStaffStats
};
