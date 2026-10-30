import { body } from "express-validator";

const nameRules = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .bail()
    .isLength({ max: 50 })
    .withMessage("El nombre no puede superar los 50 caracteres");

const descriptionRules = () =>
  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("La descripción debe ser texto")
    .trim();

export const createCategoryRules = [nameRules(), descriptionRules()];

export const replaceCategoryRules = [nameRules(), descriptionRules()];

export const updateCategoryRules = [
  body()
    .custom(
      (_, { req }) =>
        req.body !== null &&
        typeof req.body === "object" &&
        (Object.hasOwn(req.body, "name") ||
          Object.hasOwn(req.body, "description")),
    )
    .withMessage("Debes proporcionar al menos el nombre o la descripción"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío")
    .bail()
    .isLength({ max: 50 })
    .withMessage("El nombre no puede superar los 50 caracteres"),
  descriptionRules(),
];
