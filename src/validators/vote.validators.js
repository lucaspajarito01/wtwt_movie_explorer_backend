import { body } from "express-validator";

export const voteRules = [
  body("type")
    .isIn(["like", "dislike"])
    .withMessage("type debe ser 'like' o 'dislike'"),
];