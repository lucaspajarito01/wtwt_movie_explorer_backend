import BaseEntity from "./BaseEntity.js";
import { ROLES } from "../utils/roles.js";
import AppError, { ValidationError } from "../utils/AppError.js";

export const RATING = Object.freeze({ MIN: 1, MAX: 10 });
const TITLE_MAX = 100;

export default class Review extends BaseEntity {
  #movieId;
  #userId;
  #username; // solo viene en los listados (JOIN con usuarios)
  #title;
  #comment;
  #rating;

  constructor({ id, createdAt, movieId, userId, username = null, title = null, comment = null, rating }) {
    super({ id, createdAt });
    this.#movieId = BaseEntity.assertId(movieId, "movieId");
    this.#userId = BaseEntity.assertId(userId, "userId");
    this.#username = username;
    this.#title = Review.#checkTitle(title);
    this.#comment = Review.#checkComment(comment);
    this.#rating = Review.#checkRating(rating);
  }

  // Reseña nueva, todavía sin id (el autor es siempre el usuario autenticado).
  static create({ movieId, userId, title, comment, rating }) {
    return new Review({ movieId, userId, title, comment, rating });
  }

  static fromRow(row) {
    return new Review(row);
  }

  // ---- validaciones de invariantes (se aplican en el constructor y en edit())
  static #checkRating(value) {
    if (!Number.isInteger(value) || value < RATING.MIN || value > RATING.MAX) {
      throw new ValidationError(
        `La calificación debe ser un entero entre ${RATING.MIN} y ${RATING.MAX}`,
      );
    }
    return value;
  }

  static #checkTitle(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string" || value.trim().length > TITLE_MAX) {
      throw new ValidationError(`El título no puede superar los ${TITLE_MAX} caracteres`);
    }
    return value.trim();
  }

  static #checkComment(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "string") throw new ValidationError("El comentario debe ser texto");
    return value.trim();
  }

  get movieId() { return this.#movieId; }
  get userId() { return this.#userId; }
  get title() { return this.#title; }
  get comment() { return this.#comment; }
  get rating() { return this.#rating; }

  // ---- reglas de autorización (antes vivían en los servicios)
  isOwnedBy(user) {
    return Boolean(user) && this.#userId === Number(user.id);
  }

  // Editar: solo el autor.
  assertEditableBy(user) {
    if (!this.isOwnedBy(user)) {
      throw new AppError("No tienes permisos para modificar esta reseña", 403);
    }
  }

  // Eliminar: el autor o un administrador (moderación).
  assertDeletableBy(user) {
    if (!this.isOwnedBy(user) && user?.role !== ROLES.ADMIN) {
      throw new AppError("No tienes permisos para eliminar esta reseña", 403);
    }
  }

  // Votar: cualquiera menos el autor.
  assertVotableBy(user) {
    if (this.isOwnedBy(user)) {
      throw new AppError("No puedes votar tu propia reseña", 403);
    }
  }

  // Aplica cambios parciales validando cada campo; la entidad nunca queda en estado inválido.
  edit(fields) {
    const next = {
      title: Object.hasOwn(fields, "title") ? Review.#checkTitle(fields.title) : this.#title,
      comment: Object.hasOwn(fields, "comment") ? Review.#checkComment(fields.comment) : this.#comment,
      rating: Object.hasOwn(fields, "rating") ? Review.#checkRating(fields.rating) : this.#rating,
    };
    this.#title = next.title;
    this.#comment = next.comment;
    this.#rating = next.rating;
    return this;
  }

  toPersistence() {
    return {
      movieId: this.#movieId,
      userId: this.#userId,
      title: this.#title,
      comment: this.#comment,
      rating: this.#rating,
    };
  }

  toJSON() {
    const json = {
      id: this.id,
      movieId: this.#movieId,
      userId: this.#userId,
      ...(this.#username !== null && { username: this.#username }),
      title: this.#title,
      comment: this.#comment,
      rating: this.#rating,
      createdAt: this.createdAt,
    };
    return json;
  }
}
