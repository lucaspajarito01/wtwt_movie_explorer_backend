import * as Review from "../models/review.model.js";
import AppError from "../utils/AppError.js";

export async function create(fields, userId) {
  if (!(await Review.findMovieById(fields.movieId))) {
    throw new AppError("Película no encontrada", 404);
  }

  try {
    return await Review.create({ ...fields, userId });
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      throw new AppError("Película no encontrada", 404);
    }
    throw err;
  }
}

async function ensureOwner(id, userId) {
  const review = await Review.findById(id);
  if (!review) throw new AppError("Reseña no encontrada", 404);
  if (Number(review.userId) !== Number(userId)) {
    throw new AppError("No tienes permisos para modificar esta reseña", 403);
  }
}

export async function update(id, userId, fields) {
  await ensureOwner(id, userId);
  const review = await Review.updateOwned(id, userId, fields);
  if (!review) throw new AppError("Reseña no encontrada", 404);
  return review;
}

export async function remove(id, userId) {
  await ensureOwner(id, userId);
  const deleted = await Review.deleteOwned(id, userId);
  if (!deleted) throw new AppError("Reseña no encontrada", 404);
}
