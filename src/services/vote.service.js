import AppError from "../utils/AppError.js";
import Vote from "../entities/Vote.js";

async function retryOnDeadlock(fn, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code !== "ER_LOCK_DEADLOCK" || attempt >= attempts) throw err;
    }
  }
}

export default class VoteService {
  #reviews;
  #votes;
  #runInTransaction;

  constructor(reviewRepository, voteRepository, runInTransaction) {
    this.#reviews = reviewRepository;
    this.#votes = voteRepository;
    this.#runInTransaction = runInTransaction;
  }

  async #lockAndCheck(conn, reviewId, user) {
    const review = await this.#reviews.findByIdForShare(reviewId, conn);
    if (!review) throw new AppError("Reseña no encontrada", 404);
    review.assertVotableBy(user); // la regla "no votar la propia reseña" vive en la entidad
  }

  // Crea el voto o cambia like <-> dislike. Idempotente: repetir el mismo voto no duplica nada.
  vote(reviewId, user, type) {
    const vote = Vote.cast({ reviewId, user, type });
    return retryOnDeadlock(() =>
      this.#runInTransaction(async (conn) => {
        await this.#lockAndCheck(conn, reviewId, user);
        await this.#votes.upsert(vote, conn);
        return this.#votes.summarize(reviewId, user.id, conn);
      }),
    );
  }

  unvote(reviewId, user) {
    return retryOnDeadlock(() =>
      this.#runInTransaction(async (conn) => {
        await this.#lockAndCheck(conn, reviewId, user);
        await this.#votes.remove(reviewId, user.id, conn);
        return this.#votes.summarize(reviewId, user.id, conn);
      }),
    );
  }
}
