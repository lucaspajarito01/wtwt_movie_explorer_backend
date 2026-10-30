import { body } from "express-validator";

export const registerRules = [
    body('username')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim().toLowerCase()
        .isEmail().withMessage('El correo no es válido')
        .isLength({ max: 100 }).withMessage('El correo no puede superar 100 caracteres'),
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
