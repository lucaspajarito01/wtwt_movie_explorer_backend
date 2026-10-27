import pool from '../config/db.js';

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, u.password_hash, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE u.email = ?`,
    [email]
  );
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.email, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function create({ username, email, passwordHash, roleName = 'user' }) {
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role_id)
     SELECT ?, ?, ?, id FROM roles WHERE name = ?`,
    [username, email, passwordHash, roleName]
  );
  if (!result.affectedRows) {
    throw new Error(`El rol "${roleName}" no existe en la tabla roles`);
  }
  return result.insertId;
}