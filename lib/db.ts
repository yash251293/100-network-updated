import { Pool } from 'pg';

let pool: Pool;

const getPool = () => {
  if (!pool) {
    const connectionString = process.env.POSTGRES_URL || 'postgresql://flexbone_user:flexbone_password@localhost:5432/flexbone_db';
    // Add a note about using environment variables for production
    if (process.env.NODE_ENV !== 'production' && !process.env.POSTGRES_URL) {
      console.warn('WARNING: Using default PostgreSQL connection string. Set POSTGRES_URL environment variable for production.');
    }

    pool = new Pool({
      connectionString,
      // Optional: Add SSL configuration if needed for production environments
      // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

// Export a query function to easily run queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const currentPool = getPool();
  const res = await currentPool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 100), duration, rows: res.rowCount });
  return res;
};

// Optional: A function to test the connection
export const testConnection = async () => {
  try {
    const currentPool = getPool();
    await currentPool.query('SELECT NOW()');
    console.log('Database connection successful!');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
};

// Optional: Graceful shutdown
// This might be more relevant in a standalone Node.js application
// For Next.js, the server lifecycle is managed differently, but good to be aware of.
// process.on('SIGINT', async () => {
//   if (pool) {
//     console.log('Closing database connection pool...');
//     await pool.end();
//     console.log('Database pool closed.');
//   }
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   if (pool) {
//     console.log('Closing database connection pool...');
//     await pool.end();
//     console.log('Database pool closed.');
//   }
//   process.exit(0);
// });
