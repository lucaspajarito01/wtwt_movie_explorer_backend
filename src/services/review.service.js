import Review from "../entities/Review.js";
import AppError from "../utils/AppError.js";

// Orquesta casos de uso. Las reglas (validar rating, quién puede editar) viven en la entidad Review;
// el acceso a datos vive en ReviewRepository. Ambos se inyectan por constructor.
export default class ReviewService {
  #reviews;
  #runInTransaction;

  constructor(reviewRepository, runInTransaction) {
    this.#reviews = reviewRepository;
    this.#runInTransaction = runInTransaction;
  }

  async #getOrFail(id, conn) {
    const review = await this.#reviews.findById(id, conn);
    if (!review) throw new AppError("Reseña no encontrada", 404);
    return review;
  }

  async list(movieId) {
    if (!(await this.#reviews.movieExists(movieId))) {
      throw new AppError("Película no encontrada", 404);
    }
    return this.#reviews.findByMovie(movieId);
  }

  // Verificar la película e insertar la reseña ocurren en una sola transacción (RNF04).
  async create(fields, user) {
    const review = Review.create({ ...fields, userId: user.id });
    return this.#runInTransaction(async (conn) => {
      if (!(await this.#reviews.movieExists(review.movieId, conn))) {
        throw new AppError("Película no encontrada", 404);
      }
      return this.#reviews.insert(review, conn);
    });
  }

  async update(id, user, fields) {
    const review = await this.#getOrFail(id);
    review.assertEditableBy(user);
    review.edit(fields);
    return this.#reviews.update(review);
  }

  async remove(id, user) {
    const review = await this.#getOrFail(id);
    review.assertDeletableBy(user);
    await this.#reviews.delete(id);
  }
}
