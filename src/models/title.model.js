import pool from "../config/db.js";

const SELECT_TITLE = `
  SELECT p.id_pelicula AS id,
         p.titulo AS title,
         p.descripcion AS description,
         p.anio AS year,
         p.duracion AS duration,
         p.edad_recomendada AS ageRating,
         p.poster_url AS posterUrl,
         p.banner_url AS bannerUrl,
         p.trailer_url AS trailerUrl,
         p.estado AS status,
         p.id_usuario_creador AS createdBy,
         c.id_categoria AS categoryId,
         c.nombre AS category,
         d.nombre AS director,
         pl.nombre AS platform,
         i.nombre AS language
    FROM peliculas p
    LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
    LEFT JOIN director_peliculas d ON d.id_director = p.id_director
    LEFT JOIN plataformas pl ON pl.id_plataforma = p.id_plataforma
    LEFT JOIN idiomas i ON i.id_idioma = p.id_idioma`;

// solo estas columnas se pueden editar.
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

export async function findAll({ status, limit, offset }) {
    const filter = status === "todos" ? "" : "WHERE p.estado = ?";
    const params = status === "todos" ? [] : [status];

    const [items] = await pool.query(
        `${SELECT_TITLE} ${filter} ORDER BY p.id_pelicula DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
    );
    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM peliculas p ${filter}`,
        params,
    );
    return { items, total };
}

export async function findById(id) {
    const [rows] = await pool.execute(`${SELECT_TITLE} WHERE p.id_pelicula = ?`, [id]);
    return rows[0] || null;
}

//devuelve el id del registro (y si no existe lo crea)
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