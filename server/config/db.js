/**
 * Database Configuration - PostgreSQL Connection Pool
 * Uses Google DNS to resolve cloud database hostnames (fixes local DNS blocking)
 */

const { Pool } = require('pg');
const { Resolver } = require('dns').promises;

let pool = null;

async function createPool() {
  if (pool) return pool;

  let connectionConfig;

  if (process.env.DATABASE_URL) {
    // Use Google DNS to resolve hostname (fixes local DNS blocking)
    const resolver = new Resolver();
    resolver.setServers(['8.8.8.8', '8.8.4.4']);

    const url = new URL(process.env.DATABASE_URL);
    const originalHostname = url.hostname;

    try {
      const addresses = await resolver.resolve4(originalHostname);
      if (addresses.length > 0) {
        console.log(`Resolved ${originalHostname} to ${addresses[0]}`);
        connectionConfig = {
          host: addresses[0],
          port: url.port || 5432,
          user: url.username,
          password: url.password,
          database: url.pathname.slice(1),
          ssl: { rejectUnauthorized: false, servername: originalHostname }
        };
      }
    } catch (dnsErr) {
      console.log('DNS resolution failed, using original hostname');
      connectionConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      };
    }
  } else {
    connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };
  }

  pool = new Pool(connectionConfig);

  pool.on('connect', () => console.log('Connected to PostgreSQL'));
  pool.on('error', (err) => console.error('Database error:', err));

  return pool;
}

const poolPromise = createPool();

module.exports = {
  query: async (text, params) => {
    const p = await poolPromise;
    return p.query(text, params);
  },
  getPool: async () => poolPromise
};
