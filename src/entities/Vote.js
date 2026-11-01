import BaseEntity from "./BaseEntity.js";
import { ValidationError } from "../utils/AppError.js";

export const VOTE_TYPES = Object.freeze({ LIKE: "like", DISLIKE: "dislike" });

export default class Vote extends BaseEntity {
  #reviewId;
  #userId;
  #type;

  constructor({ id, createdAt, reviewId, userId, type }) {
    super({ id, createdAt });
    this.#reviewId = BaseEntity.assertId(reviewId, "reviewId");
    this.#userId = BaseEntity.assertId(userId, "userId");
    if (!Object.values(VOTE_TYPES).includes(type)) {
      throw new ValidationError("type debe ser 'like' o 'dislike'");
    }
    this.#type = type;
  }

  // Un usuario emite un voto sobre una reseña (aún sin guardar).
  static cast({ reviewId, user, type }) {
    return new Vote({ reviewId, userId: user.id, type });
  }

  get reviewId() { return this.#reviewId; }
  get userId() { return this.#userId; }
  get type() { return this.#type; }

  toPersistence() {
    return { reviewId: this.#reviewId, userId: this.#userId, type: this.#type };
  }

  toJSON() {
    return { reviewId: this.#reviewId, userId: this.#userId, type: this.#type };
  }
}

// Resultado de consultar los votos de una reseña (objeto de valor, inmutable).
export class VoteSummary {
  #reviewId; #likes; #dislikes; #userVote;

  constructor({ reviewId, likes = 0, dislikes = 0, userVote = null }) {
    this.#reviewId = reviewId;
    this.#likes = Number(likes);
    this.#dislikes = Number(dislikes);
    this.#userVote = userVote;
    Object.freeze(this);
  }

  get netScore() { return this.#likes - this.#dislikes; }

  toJSON() {
    return { reviewId: this.#reviewId, likes: this.#likes, dislikes: this.#dislikes, userVote: this.#userVote };
  }
}
