
import { Pool } from 'pg';

const connectionConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || ''),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
};

export const pool = new Pool(connectionConfig);

if (!connectionConfig.host || !connectionConfig.user || !connectionConfig.password || !connectionConfig.database || !connectionConfig.port) {
  throw new Error('Missing required database environment variables');
}

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export default pool;
