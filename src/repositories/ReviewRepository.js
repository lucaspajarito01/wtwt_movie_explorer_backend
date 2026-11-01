import BaseRepository from "./BaseRepository.js";
import Review from "../entities/Review.js";

const COLUMNS = `
  r.id_resena AS id, r.id_pelicula AS movieId, r.id_usuario AS userId,
  r.titulo_resena AS title, r.comentario AS comment,
  r.calificacion AS rating, r.fecha_creacion AS createdAt`;

export default class ReviewRepository extends BaseRepository {
  async movieExists(movieId, conn) {
    const [rows] = await this.executor(conn).execute(
      "SELECT 1 FROM peliculas WHERE id_pelicula = ?",
      [movieId],
    );
    return rows.length > 0;
  }

  async findById(id, conn) {
    const [rows] = await this.executor(conn).execute(
      `SELECT ${COLUMNS} FROM resenas r WHERE r.id_resena = ?`,
      [id],
    );
    return rows[0] ? Review.fromRow(rows[0]) : null;
  }

  // Lectura con bloqueo compartido: la usa el voto dentro de su transacción.
  async findByIdForShare(id, conn) {
    const [rows] = await this.executor(conn).execute(
      `SELECT ${COLUMNS} FROM resenas r WHERE r.id_resena = ? FOR SHARE`,
      [id],
    );
    return rows[0] ? Review.fromRow(rows[0]) : null;
  }

  async findByMovie(movieId, conn) {
    const [rows] = await this.executor(conn).execute(
      `SELECT ${COLUMNS}, u.nombre AS username
         FROM resenas r
         JOIN usuarios u ON u.id_usuario = r.id_usuario
        WHERE r.id_pelicula = ?
        ORDER BY r.fecha_creacion DESC`,
      [movieId],
    );
    return rows.map((row) => Review.fromRow(row));
  }

  async insert(review, conn) {
    const { movieId, userId, title, comment, rating } = review.toPersistence();
    const [result] = await this.executor(conn).execute(
      `INSERT INTO resenas (id_pelicula, id_usuario, titulo_resena, comentario, calificacion)
       VALUES (?, ?, ?, ?, ?)`,
      [movieId, userId, title, comment, rating],
    );
    return this.findById(result.insertId, conn);
  }

  async update(review, conn) {
    const { title, comment, rating } = review.toPersistence();
    await this.executor(conn).execute(
      `UPDATE resenas SET titulo_resena = ?, comentario = ?, calificacion = ?
        WHERE id_resena = ?`,
      [title, comment, rating, review.id],
    );
    return this.findById(review.id, conn);
  }

  async delete(id, conn) {
    const [result] = await this.executor(conn).execute(
      "DELETE FROM resenas WHERE id_resena = ?",
      [id],
    );
    return result.affectedRows > 0;
  }
}
