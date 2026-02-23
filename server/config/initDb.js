require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Initializing database...');
    await pool.query(schema);
    console.log('Database tables created successfully!');

    await pool.end();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initializeDatabase();
