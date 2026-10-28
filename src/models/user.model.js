import pool from "../config/db.js";

export const DEFAULT_ROLE = "usuario";

export async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario AS id, u.nombre AS username, u.correo AS email,
            u.contrasena AS password_hash, u.estado, r.nombre AS role
        FROM usuarios u
        JOIN roles r ON r.id = u.role_id
      WHERE u.correo = ?`,
    [email],
  );
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT u.id_usuario AS id, u.nombre AS username, u.correo AS email,
            u.estado, r.nombre AS role
      FROM usuarios u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id_usuario = ?`,
    [id],
  );
  return rows[0] || null;
}

export async function create({
  username,
  email,
  passwordHash,
  roleName = DEFAULT_ROLE,
}) {
  const [result] = await pool.execute(
    `INSERT INTO usuarios (nombre, correo, contrasena, role_id)
      SELECT ?, ?, ?, id FROM roles WHERE nombre = ?`,
    [username, email, passwordHash, roleName],
  );
  if (!result.affectedRows) {
    throw new Error(`El rol "${roleName}" no existe en la tabla roles`);
  }
  return result.insertId;
}
