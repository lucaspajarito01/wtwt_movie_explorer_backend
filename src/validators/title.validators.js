import { body, query } from "express-validator";
import { paginationRules } from "./common.validators.js";

// Campos que el cliente puede enviar
export const TITLE_FIELDS = [
    "title",
    "description",
    "categoryId",
    "year",
    "duration",
    "ageRating",
    "posterUrl",
    "bannerUrl",
    "trailerUrl",
    "director",
    "platform",
    "language",
];

const MAX_YEAR = new Date().getFullYear() + 5;

// Esto es obligatorio para crear pero opcional para editar
const required = (name, partial) =>
    partial ? body(name).optional() : body(name);

// Opcional siempre
const optionalText = (name, label, max) =>
    body(name)
        .optional({ nullable: true })
        .isString()
        .withMessage(`${label} debe ser texto`)
        .bail()
        .trim()
        .notEmpty()
        .withMessage(`${label} no puede estar vacío (usa null para borrarlo)`)
        .bail()
        .isLength({ max })
        .withMessage(`${label} no puede superar los ${max} caracteres`);

const optionalUrl = (name, label) =>
    body(name)
        .optional({ nullable: true })
        .isString()
        .withMessage(`${label} debe ser texto`)
        .bail()
        .trim()
        .isURL({ protocols: ["http", "https"], require_protocol: true })
        .withMessage(`${label} debe ser una URL http(s) válida`)
        .bail()
        .isLength({ max: 255 })
        .withMessage(`${label} no puede superar los 255 caracteres`);

const titleRules = (partial) => [
    required("title", partial)
        .isString()
        .withMessage("El título debe ser texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("El título es obligatorio")
        .bail()
        .isLength({ max: 150 })
        .withMessage("El título no puede superar los 150 caracteres"),
    required("description", partial)
        .isString()
        .withMessage("La descripción debe ser texto")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("La descripción es obligatoria")
        .bail()
        .isLength({ max: 5000 })
        .withMessage("La descripción no puede superar los 5000 caracteres"),
    required("categoryId", partial)
        .notEmpty()
        .withMessage("La categoría es obligatoria")
        .bail()
        .isInt({ min: 1 })
        .withMessage("categoryId debe ser un entero positivo")
        .toInt(),
    required("year", partial)
        .notEmpty()
        .withMessage("El año es obligatorio")
        .bail()
        .isInt({ min: 1888, max: MAX_YEAR })
        .withMessage(`El año debe estar entre 1888 y ${MAX_YEAR}`)
        .toInt(),
    optionalText("duration", "La duración", 50),
    optionalText("ageRating", "La edad recomendada", 20),
    optionalText("director", "El director", 30),
    optionalText("platform", "La plataforma", 30),
    optionalText("language", "El idioma", 30),
    optionalUrl("posterUrl", "El póster"),
    optionalUrl("bannerUrl", "El banner"),
    optionalUrl("trailerUrl", "El tráiler"),
];

export const createTitleRules = titleRules(false);

export const updateTitleRules = [
    body()
        .custom(
            (_, { req }) =>
                req.body !== null &&
                typeof req.body === "object" &&
                TITLE_FIELDS.some((field) => Object.hasOwn(req.body, field)),
        )
        .withMessage("Debes enviar al menos un campo para actualizar"),
    ...titleRules(true),
];

export const listTitleRules = [
    ...paginationRules,
    query("estado")
        .optional()
        .isIn(["aprobado", "pendiente", "todos"])
        .withMessage("estado debe ser aprobado, pendiente o todos"),
];
