// Composición de dependencias: el único lugar donde se crean las instancias y se "enchufan" entre sí.
import pool, { withTransaction } from "./config/db.js";
import config from "./config/env.js";
import { signToken } from "./utils/jwt.js";
import UserRepository from "./repositories/UserRepository.js";
import ReviewRepository from "./repositories/ReviewRepository.js";
import AuthService from "./services/auth.service.js";
import ReviewService from "./services/review.service.js";
import VoteService from "./services/vote.service.js";
import TitleRepository from "./repositories/TitleRepository.js";
import CategoryRepository from "./repositories/CategoryRepository.js";
import VoteRepository from "./repositories/VoteRepository.js";
import TitleService from "./services/title.service.js";
import CategoryService from "./services/category.service.js";

export const userRepository = new UserRepository(pool);
export const reviewRepository = new ReviewRepository(pool);
export const titleRepository = new TitleRepository(pool);
export const categoryRepository = new CategoryRepository(pool);
export const voteRepository = new VoteRepository(pool);

export const authService = new AuthService(userRepository, {
  signToken,
  bcryptRounds: config.bcryptRounds,
});
export const reviewService = new ReviewService(reviewRepository, withTransaction);
export const voteService = new VoteService(reviewRepository, voteRepository, withTransaction);
export const titleService = new TitleService(titleRepository, withTransaction);
export const categoryService = new CategoryService(categoryRepository);
