import { body } from "express-validator";

const ratingRule = () =>
  body("rating")
    .isInt({ min: 1, max: 10 })
    .withMessage("La calificación debe ser un entero entre 1 y 10")
    .toInt();

const titleRule = () =>
  body("title")
    .optional({ nullable: true })
    .isString()
    .withMessage("El título debe ser texto")
    .bail()
    .trim()
    .isLength({ max: 100 })
    .withMessage("El título no puede superar los 100 caracteres");

const commentRule = () =>
  body("comment")
    .optional({ nullable: true })
    .isString()
    .withMessage("El comentario debe ser texto")
    .bail()
    .trim();

export const createReviewRules = [
  body("movieId")
    .isInt({ min: 1 })
    .withMessage("movieId debe ser un entero positivo")
    .toInt(),
  ratingRule(),
  titleRule(),
  commentRule(),
];

export const replaceReviewRules = [ratingRule(), titleRule(), commentRule()];

export const updateReviewRules = [
  body()
    .custom(
      (_, { req }) =>
        req.body !== null &&
        typeof req.body === "object" &&
        ["rating", "title", "comment"].some((field) =>
          Object.hasOwn(req.body, field),
        ),
    )
    .withMessage("Debes proporcionar al menos la calificación, el título o el comentario"),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("La calificación debe ser un entero entre 1 y 10")
    .toInt(),
  titleRule(),
  commentRule(),
];
