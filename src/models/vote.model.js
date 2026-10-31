import pool from "../config/db.js";

export async function lockReview(conn, reviewId) {
  const [rows] = await conn.execute(
    "SELECT id_resena AS id, id_usuario AS userId FROM resenas WHERE id_resena = ? FOR SHARE",
    [reviewId],
  );
  return rows[0] || null;
}

// Un voto por usuario y reseña
export async function upsert(conn, reviewId, userId, type) {
  await conn.execute(
    `INSERT INTO resena_votos (id_resena, id_usuario, tipo_voto)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE tipo_voto = VALUES(tipo_voto)`,
    [reviewId, userId, type],
  );
}

export async function remove(conn, reviewId, userId) {
  await conn.execute(
    "DELETE FROM resena_votos WHERE id_resena = ? AND id_usuario = ?",
    [reviewId, userId],
  );
}

export async function getSummary(conn, reviewId, userId) {
  const [[counts]] = await conn.execute(
    `SELECT COUNT(CASE WHEN tipo_voto = 'like' THEN 1 END)    AS likes,
            COUNT(CASE WHEN tipo_voto = 'dislike' THEN 1 END) AS dislikes
       FROM resena_votos
      WHERE id_resena = ?`,
    [reviewId],
  );
  const [mine] = await conn.execute(
    "SELECT tipo_voto AS type FROM resena_votos WHERE id_resena = ? AND id_usuario = ?",
    [reviewId, userId],
  );
  return {
    reviewId,
    likes: counts.likes,
    dislikes: counts.dislikes,
    userVote: mine[0]?.type ?? null,
  };
}

// Para lecturas fuera de transacción (para listados, ranking)
export const getSummaryOutsideTx = (reviewId, userId) =>
  getSummary(pool, reviewId, userId);