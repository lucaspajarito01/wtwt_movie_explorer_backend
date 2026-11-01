import BaseRepository from "./BaseRepository.js";
import { VoteSummary } from "../entities/Vote.js";

export default class VoteRepository extends BaseRepository {
  // Un voto por usuario y reseña (UNIQUE): repetir el voto o cambiarlo no duplica filas.
  async upsert(vote, conn) {
    const { reviewId, userId, type } = vote.toPersistence();
    await this.executor(conn).execute(
      `INSERT INTO resena_votos (id_resena, id_usuario, tipo_voto)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE tipo_voto = VALUES(tipo_voto)`,
      [reviewId, userId, type],
    );
  }

  async remove(reviewId, userId, conn) {
    await this.executor(conn).execute(
      "DELETE FROM resena_votos WHERE id_resena = ? AND id_usuario = ?",
      [reviewId, userId],
    );
  }

  async summarize(reviewId, userId, conn) {
    const db = this.executor(conn);
    const [[counts]] = await db.execute(
      `SELECT COUNT(CASE WHEN tipo_voto = 'like' THEN 1 END)    AS likes,
              COUNT(CASE WHEN tipo_voto = 'dislike' THEN 1 END) AS dislikes
         FROM resena_votos
        WHERE id_resena = ?`,
      [reviewId],
    );
    const [mine] = await db.execute(
      "SELECT tipo_voto AS type FROM resena_votos WHERE id_resena = ? AND id_usuario = ?",
      [reviewId, userId],
    );
    return new VoteSummary({ reviewId, ...counts, userVote: mine[0]?.type ?? null });
  }
}
