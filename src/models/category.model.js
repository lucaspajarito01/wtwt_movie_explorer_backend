import pool from "../config/db.js";

const CATEGORY_COLUMNS = `
  id_categoria AS id,
  nombre AS name,
  descripcion AS description
`;

export async function findAll() {
  const [rows] = await pool.execute(
    `SELECT ${CATEGORY_COLUMNS} FROM categorias ORDER BY nombre`,
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${CATEGORY_COLUMNS} FROM categorias WHERE id_categoria = ?`,
    [id],
  );
  return rows[0] || null;
}

export async function create({ name, description }) {
  const [result] = await pool.execute(
    "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
    [name, description ?? null],
  );
  return findById(result.insertId);
}

export async function update(id, fields) {
  const columns = [];
  const values = [];

  if (Object.hasOwn(fields, "name")) {
    columns.push("nombre = ?");
    values.push(fields.name);
  }
  if (Object.hasOwn(fields, "description")) {
    columns.push("descripcion = ?");
    values.push(fields.description);
  }

  values.push(id);
  await pool.execute(
    `UPDATE categorias SET ${columns.join(", ")} WHERE id_categoria = ?`,
    values,
  );
  return findById(id);
}

export async function remove(id) {
  const [result] = await pool.execute(
    "DELETE FROM categorias WHERE id_categoria = ?",
    [id],
  );
  return result.affectedRows > 0;
}
