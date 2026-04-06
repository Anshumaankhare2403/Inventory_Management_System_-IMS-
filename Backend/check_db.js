const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function checkDb() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ims_db'
    });

    try {
        const [tables] = await pool.query('SHOW TABLES');
        const schema = {};
        
        for (let row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            schema[tableName] = columns;
        }
        fs.writeFileSync('db_schema.json', JSON.stringify(schema, null, 2));
        console.log("Schema saved to db_schema.json");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

checkDb();
