
import { Pool } from 'pg';

const connectionConfig = {
  host: process.env.DB_HOST || 'db.redeis.com.br',
  port: parseInt(process.env.DB_PORT || '5555'),
  user: process.env.DB_USER || 'sotech',
  password: process.env.DB_PASSWORD || 'SthNox@2022',
  database: process.env.DB_NAME || 'dbapr',
  ssl: {
    rejectUnauthorized: false
  },
  schema: process.env.DB_SCHEMA || 'sotech'
};

export const pool = new Pool(connectionConfig);

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
