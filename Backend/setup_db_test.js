const pool = require('./config/db');

async function setupDatabase() {
    try {
        console.log("Setting up DB...");
        // 1. Stored Procedure for Low Stock Alerts
        await pool.query(`DROP PROCEDURE IF EXISTS check_low_stock`);
        await pool.query(`
            CREATE PROCEDURE check_low_stock(IN threshold INT)
            BEGIN
                SELECT id, name, sku, stock_quantity 
                FROM products 
                WHERE stock_quantity <= threshold;
            END;
        `);
        console.log("Stored Procedure created.");

        // 2. Trigger for stock update after order items (Assuming simple Sales decreases stock, Purchase increases stock)
        
        await pool.query(`DROP TRIGGER IF EXISTS after_order_item_insert`);
        await pool.query(`
            CREATE TRIGGER after_order_item_insert
            AFTER INSERT ON order_items
            FOR EACH ROW
            BEGIN
                DECLARE order_type VARCHAR(20);
                DECLARE order_status VARCHAR(20);
                
                SELECT type, status INTO order_type, order_status FROM orders WHERE id = NEW.order_id;
                
                IF order_type = 'Sales' THEN
                    UPDATE products SET stock_quantity = stock_quantity - NEW.quantity WHERE id = NEW.product_id;
                    INSERT INTO inventory_logs (product_id, user_id, type, quantity, reason) 
                    VALUES (NEW.product_id, NULL, 'OUT', NEW.quantity, CONCAT('Order Item Added: Order ', NEW.order_id));
                ELSEIF order_type = 'Purchase' THEN
                    UPDATE products SET stock_quantity = stock_quantity + NEW.quantity WHERE id = NEW.product_id;
                    INSERT INTO inventory_logs (product_id, user_id, type, quantity, reason) 
                    VALUES (NEW.product_id, NULL, 'IN', NEW.quantity, CONCAT('Order Item Added: Order ', NEW.order_id));
                END IF;
            END;
        `);
        console.log("Trigger created.");

        // 3. Clear existing data
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('TRUNCATE TABLE inventory_logs');
        await pool.query('TRUNCATE TABLE order_items');
        await pool.query('TRUNCATE TABLE orders');
        await pool.query('TRUNCATE TABLE products');
        await pool.query('TRUNCATE TABLE suppliers');
        await pool.query('TRUNCATE TABLE categories');
        await pool.query('TRUNCATE TABLE users');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("Tables truncated.");

        // 4. Insert Categories
        await pool.query(`INSERT INTO categories (name, description) VALUES 
            ('Electronics', 'Electronic devices and gadgets'),
            ('Clothing', 'Apparel and accessories')
        `);
        
        // 5. Insert Suppliers
        await pool.query(`INSERT INTO suppliers (name, contact_person, email, phone) VALUES 
            ('Tech Distributors', 'Alice Smith', 'alice@techdist.com', '1234567890'),
            ('Fashion Hub', 'Bob Jones', 'bob@fashionhub.com', '0987654321')
        `);

        // 6. Insert Products
        await pool.query(`INSERT INTO products (name, description, sku, price, cost_price, stock_quantity, category_id, supplier_id) VALUES 
            ('Laptop XL', 'High end laptop', 'LAP-XL-001', 1200.00, 1000.00, 50, 1, 1),
            ('T-shirt Basic', 'Cotton t-shirt', 'TSH-BAS-002', 15.00, 5.00, 200, 2, 2)
        `);

        // 7. Insert Users
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash('password123', 10);
        await pool.query(`INSERT INTO users (name, username, email, password, role) VALUES 
            ('Admin User', 'admin', 'admin@example.com', ?, 'Admin'),
            ('Staff User', 'staff', 'staff@example.com', ?, 'Staff')
        `, [hash, hash]);

        console.log("Dummy data inserted.");
        process.exit(0);

    } catch (e) {
        console.error("Error setting up DB:", e);
        process.exit(1);
    }
}

setupDatabase();
