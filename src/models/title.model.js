import pool from "../config/db.js";
import { RANKING as R } from "../config/ranking.js";

// Estadísticas por título: nº de reseñas, promedio simple y sumas ponderadas para el ranking.
// peso de una reseña = factor por votos (0.5..3) × decaimiento por antigüedad (0.5^(días/180))
const STATS_JOIN = `
  LEFT JOIN (
    SELECT w.id_pelicula,
           COUNT(*)                     AS review_count,
           AVG(w.calificacion)          AS avg_rating,
           SUM(w.calificacion * w.peso) AS weighted_sum,
           SUM(w.peso)                  AS weight_sum
      FROM (
        SELECT r.id_pelicula,
               r.calificacion,
               LEAST(${R.maxReviewWeight}, GREATEST(${R.minReviewWeight},
                     1 + ${R.voteStep} * (COALESCE(v.likes, 0) - COALESCE(v.dislikes, 0))))
               * POW(0.5, GREATEST(DATEDIFF(CURDATE(), DATE(r.fecha_creacion)), 0) / ${R.halfLifeDays}) AS peso
          FROM resenas r
          LEFT JOIN (
            SELECT id_resena,
                   COUNT(CASE WHEN tipo_voto = 'like' THEN 1 END)    AS likes,
                   COUNT(CASE WHEN tipo_voto = 'dislike' THEN 1 END) AS dislikes
              FROM resena_votos
             GROUP BY id_resena
          ) v ON v.id_resena = r.id_resena
      ) w
     GROUP BY w.id_pelicula
  ) stats ON stats.id_pelicula = p.id_pelicula
  CROSS JOIN (
    SELECT COALESCE(AVG(calificacion), ${R.defaultMean}) AS mean FROM resenas
  ) g`;

const SELECT_TITLE = `
  SELECT p.id_pelicula       AS id,
         p.titulo            AS title,
         p.descripcion       AS description,
         p.anio              AS year,
         p.duracion          AS duration,
         p.edad_recomendada  AS ageRating,
         p.poster_url        AS posterUrl,
         p.banner_url        AS bannerUrl,
         p.trailer_url       AS trailerUrl,
         p.estado            AS status,
         p.id_usuario_creador AS createdBy,
         c.id_categoria      AS categoryId,
         c.nombre            AS category,
         d.nombre            AS director,
         pl.nombre           AS platform,
         i.nombre            AS language,
         COALESCE(stats.review_count, 0) AS reviewCount,
         stats.avg_rating                AS avgRating,
         CASE WHEN stats.review_count IS NULL THEN NULL
              ELSE (${R.priorWeight} * g.mean + stats.weighted_sum)
                   / (${R.priorWeight} + stats.weight_sum)
         END                             AS score
    FROM peliculas p
    LEFT JOIN categorias c          ON c.id_categoria   = p.id_categoria
    LEFT JOIN director_peliculas d  ON d.id_director    = p.id_director
    LEFT JOIN plataformas pl        ON pl.id_plataforma = p.id_plataforma
    LEFT JOIN idiomas i             ON i.id_idioma      = p.id_idioma
    ${STATS_JOIN}`;

// Criterios de orden permitidos (lista blanca: nunca se interpola texto del cliente).
// Todos terminan en p.id_pelicula para que el orden sea determinista ante empates.
// En DESC, MySQL deja los NULL al final: los títulos sin reseñas quedan después.
const ORDERS = {
  recent: "p.id_pelicula DESC",
  ranking: "score DESC, reviewCount DESC, p.id_pelicula DESC",
  rating: "avgRating DESC, reviewCount DESC, p.id_pelicula DESC",
  reviews: "reviewCount DESC, p.id_pelicula DESC",
  title: "p.titulo ASC, p.id_pelicula ASC",
  year: "p.anio DESC, p.id_pelicula DESC",
};
export const TITLE_SORTS = Object.keys(ORDERS);

// mysql2 entrega AVG/DECIMAL como texto: se convierte y redondea solo para mostrar
const round = (value, decimals) =>
  value === null || value === undefined ? null : Number(Number(value).toFixed(decimals));

const toTitle = (row) => ({
  ...row,
  reviewCount: Number(row.reviewCount),
  avgRating: round(row.avgRating, 1),
  score: round(row.score, 2),
});

// Atributo de la API -> columna. Solo estas columnas se pueden editar.
const COLUMN_MAP = {
  title: "titulo",
  description: "descripcion",
  categoryId: "id_categoria",
  year: "anio",
  duration: "duracion",
  ageRating: "edad_recomendada",
  posterUrl: "poster_url",
  bannerUrl: "banner_url",
  trailerUrl: "trailer_url",
  directorId: "id_director",
  platformId: "id_plataforma",
  languageId: "id_idioma",
};

export async function findAll({ status, categoryId, sort = "recent", limit, offset }) {
  const conditions = [];
  const params = [];
  if (status !== "todos") {
    conditions.push("p.estado = ?");
    params.push(status);
  }
  if (categoryId) {
    conditions.push("p.id_categoria = ?");
    params.push(categoryId);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = ORDERS[sort] ?? ORDERS.recent;

  // query() y no execute(): MySQL 8 rechaza LIMIT/OFFSET como parámetros preparados
  const [rows] = await pool.query(
    `${SELECT_TITLE} ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM peliculas p ${where}`,
    params,
  );
  return { items: rows.map(toTitle), total };
}

export async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_TITLE} WHERE p.id_pelicula = ?`, [id]);
  return rows[0] ? toTitle(rows[0]) : null;
}

// Devuelve el id del registro (lo crea si no existe). Atómico gracias al UNIQUE de nombre.
export async function findOrCreateRef(conn, table, idColumn, name) {
  if (name === null) return null;
  const [result] = await conn.execute(
    `INSERT INTO ${table} (nombre) VALUES (?)
     ON DUPLICATE KEY UPDATE ${idColumn} = LAST_INSERT_ID(${idColumn})`,
    [name],
  );
  return result.insertId;
}

export async function insert(conn, f) {
  const [result] = await conn.execute(
    `INSERT INTO peliculas
       (titulo, descripcion, id_categoria, anio, duracion, id_director,
        id_plataforma, id_idioma, edad_recomendada, poster_url, banner_url,
        trailer_url, estado, id_usuario_creador)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      f.title,
      f.description,
      f.categoryId,
      f.year,
      f.duration ?? null,
      f.directorId ?? null,
      f.platformId ?? null,
      f.languageId ?? null,
      f.ageRating ?? null,
      f.posterUrl ?? null,
      f.bannerUrl ?? null,
      f.trailerUrl ?? null,
      f.status,
      f.createdBy,
    ],
  );
  return result.insertId;
}

export async function update(conn, id, fields) {
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(COLUMN_MAP)) {
    if (Object.hasOwn(fields, key)) {
      sets.push(`${column} = ?`);
      values.push(fields[key] ?? null);
    }
  }
  if (sets.length === 0) return;
  await conn.execute(
    `UPDATE peliculas SET ${sets.join(", ")} WHERE id_pelicula = ?`,
    [...values, id],
  );
}

export async function approve(id) {
  const [result] = await pool.execute(
    "UPDATE peliculas SET estado = 'aprobado' WHERE id_pelicula = ? AND estado = 'pendiente'",
    [id],
  );
  return result.affectedRows > 0;
}

export async function remove(id) {
  const [result] = await pool.execute(
    "DELETE FROM peliculas WHERE id_pelicula = ?",
    [id],
  );
  return result.affectedRows > 0;
}