import { body } from "express-validator";

export const registerRules = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage("El nombre de usuario debe tener entre 3 y 30 caracteres")
        .matches(/^\w+$/)
        .withMessage(
            "El nombre de usuario solo admite letras, números y guion bajo",
        ),
    body("email")
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("El correo no es válido"),
    body("password")
        .isLength({ min: 8, max: 72 })
        .withMessage("La contraseña debe tener entre 8 y 72 caracteres")
        .matches(/[A-Za-z]/)
        .withMessage("La contraseña debe incluir al menos una letra")
        .matches(/\d/)
        .withMessage("La contraseña debe incluir al menos un número"),
];

export const loginRules = [
    body("email")
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("El correo no es válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];
