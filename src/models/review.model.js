import pool from "../config/db.js";

const REVIEW_COLUMNS = `
  id_resena AS id,
  id_pelicula AS movieId,
  id_usuario AS userId,
  titulo_resena AS title,
  comentario AS comment,
  calificacion AS rating,
  fecha_creacion AS createdAt
`;

export async function findMovieById(id) {
  const [rows] = await pool.execute(
    "SELECT id_pelicula FROM peliculas WHERE id_pelicula = ?",
    [id],
  );
  return rows[0] || null;
}

export async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT ${REVIEW_COLUMNS} FROM resenas WHERE id_resena = ?`,
    [id],
  );
  return rows[0] || null;
}

export async function findByMovie(movieId) {
  const [rows] = await pool.execute(
    "SELECT r.id_resena AS id, r.id_pelicula AS movieId, r.id_usuario AS userId, u.nombre AS username, r.titulo_resena AS title, r.comentario AS comment, r.calificacion AS rating, r.fecha_creacion AS createdAt FROM resenas r JOIN usuarios u ON u.id_usuario = r.id_usuario WHERE r.id_pelicula = ? ORDER BY r.fecha_creacion DESC",
    [movieId],
  );
  return rows;
}

export async function create({ movieId, userId, title, comment, rating }) {
  const [result] = await pool.execute(
    `INSERT INTO resenas
      (id_pelicula, id_usuario, titulo_resena, comentario, calificacion)
      VALUES (?, ?, ?, ?, ?)`,
    [movieId, userId, title ?? null, comment ?? null, rating],
  );
  return findById(result.insertId);
}

export async function updateOwned(id, userId, fields) {
  const columns = [];
  const values = [];

  if (Object.hasOwn(fields, "title")) {
    columns.push("titulo_resena = ?");
    values.push(fields.title);
  }
  if (Object.hasOwn(fields, "comment")) {
    columns.push("comentario = ?");
    values.push(fields.comment);
  }
  if (Object.hasOwn(fields, "rating")) {
    columns.push("calificacion = ?");
    values.push(fields.rating);
  }

  values.push(id, userId);
  await pool.execute(
    `UPDATE resenas SET ${columns.join(", ")}
      WHERE id_resena = ? AND id_usuario = ?`,
    values,
  );
  return findById(id);
}

export async function deleteOwned(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM resenas WHERE id_resena = ? AND id_usuario = ?",
    [id, userId],
  );
  return result.affectedRows > 0;
}
