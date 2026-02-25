require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { Resolver } = require('dns').promises;

async function initializeDatabase() {
  try {
    let connectionConfig;

    if (process.env.DATABASE_URL) {
      // Use Google DNS to resolve hostname
      const resolver = new Resolver();
      resolver.setServers(['8.8.8.8', '8.8.4.4']);

      const url = new URL(process.env.DATABASE_URL);
      const originalHostname = url.hostname;

      try {
        const addresses = await resolver.resolve4(originalHostname);
        if (addresses.length > 0) {
          console.log(`Resolved ${originalHostname} to ${addresses[0]}`);

          // Use IP for connection but keep hostname for SSL verification
          connectionConfig = {
            host: addresses[0],
            port: url.port || 5432,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
            ssl: {
              rejectUnauthorized: false,
              servername: originalHostname
            }
          };
        }
      } catch (dnsErr) {
        console.log('DNS resolution with Google DNS failed, using original hostname');
        connectionConfig = {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        };
      }
    } else {
      connectionConfig = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      };
    }

    const pool = new Pool(connectionConfig);
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
