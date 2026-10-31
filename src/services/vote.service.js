import { withTransaction } from "../config/db.js";
import * as Vote from "../models/vote.model.js";
import AppError from "../utils/AppError.js";

async function retryOnDeadlock(fn, attempts = 3) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code !== "ER_LOCK_DEADLOCK" || attempt >= attempts) throw err;
    }
  }
}

async function lockAndCheck(conn, reviewId, userId) {
  const review = await Vote.lockReview(conn, reviewId);
  if (!review) throw new AppError("Reseña no encontrada", 404);
  if (Number(review.userId) === Number(userId)) {
    throw new AppError("No puedes votar tu propia reseña", 403);
  }
}

// Crea el voto o cambia like <-> dislike. Idempotente: repetir el mismo voto no duplica nada.
export function vote(reviewId, userId, type) {
  return retryOnDeadlock(() =>
    withTransaction(async (conn) => {
      await lockAndCheck(conn, reviewId, userId);
      await Vote.upsert(conn, reviewId, userId, type);
      return Vote.getSummary(conn, reviewId, userId);
    }),
  );
}

export function unvote(reviewId, userId) {
  return retryOnDeadlock(() =>
    withTransaction(async (conn) => {
      await lockAndCheck(conn, reviewId, userId);
      await Vote.remove(conn, reviewId, userId);
      return Vote.getSummary(conn, reviewId, userId);
    }),
  );
}