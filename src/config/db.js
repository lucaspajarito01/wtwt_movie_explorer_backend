import { createPool } from 'mysql2/promise';
import config from './env.js';

const pool = createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function checkConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

// Uso: await withTransaction(async (conn) => { await conn.execute(...); ... });
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default pool;