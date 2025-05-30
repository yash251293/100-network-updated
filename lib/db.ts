import { Pool } from 'pg';

// Check if the process is running in a Node.js environment
if (typeof process === 'undefined' || !process.env) {
  throw new Error('This script is intended to run in a Node.js environment.');
}

// Ensure environment variables are loaded. In Next.js, .env.local is loaded automatically.
// For other environments, you might need a library like dotenv.

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing POSTGRES_URL environment variable for database connection in production.');
  } else {
    // In development or testing, you might want to provide a default or a clearer message.
    // For this setup, we'll still throw an error if it's not set,
    // as the .env.example will guide the user.
    console.warn(
      'Warning: POSTGRES_URL environment variable is not set. Please ensure it is configured in your .env.local file.'
    );
    // Depending on the strategy, you might provide a default local dev URL here,
    // but it's often better to require explicit configuration.
    // Example: POSTGRES_URL = 'postgresql://app_user:app_password@localhost:5432/app_dev_db';
    // For now, we will throw to ensure it's set up.
     throw new Error('Missing POSTGRES_URL environment variable. Please set it in your .env.local file based on .env.example.');
  }
}

let pool: Pool;

try {
  pool = new Pool({
    connectionString: POSTGRES_URL,
    // Optional: Add SSL configuration for production environments if needed
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Optional: Other pool configurations
    // max: 20, // max number of clients in the pool
    // idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
    // connectionTimeoutMillis: 2000, // how long to wait for a client to connect
  });
} catch (error) {
  console.error('Failed to initialize PostgreSQL pool:', error);
  // Depending on the application's needs, you might want to exit the process
  // or allow the app to start and handle DB connection issues elsewhere.
  // For Next.js API routes, failing early if the pool can't be configured is often better.
  throw new Error('Could not create PostgreSQL connection pool. Check your POSTGRES_URL and database server.');
}


// Optional: Test the connection
// It's good practice to test the connection when the pool is initialized,
// especially during application startup in a server environment.
// However, in a serverless Next.js API route context, the pool might connect on first query.
// For simplicity here, we won't add an immediate connection test, but it can be added.
/*
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for initial connection test', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release client back to the pool
    if (err) {
      return console.error('Error executing query for initial connection test', err.stack);
    }
    console.log('Successfully connected to PostgreSQL. Current time from DB:', result.rows[0].now);
  });
});
*/

// Export a query function or the pool itself
// Exporting a query function can encapsulate some logic, like releasing clients.
// export const query = (text: string, params?: any[]) => pool.query(text, params);

// Or export the pool directly for more flexibility
export default pool;

// Graceful shutdown (important for server environments, less so for serverless API routes
// but good practice if this module is used elsewhere).
// In Next.js, this might be managed differently or not be as critical for API routes
// which are often short-lived.
/*
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    console.log('Attempting to gracefully close PostgreSQL pool on SIGINT');
    await pool.end();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Attempting to gracefully close PostgreSQL pool on SIGTERM');
    await pool.end();
    process.exit(0);
  });
}
*/
