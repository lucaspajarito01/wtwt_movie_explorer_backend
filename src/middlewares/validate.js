import { validationResult } from 'express-validator';
import AppError from "../utils/AppError.js";

export default function validate(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    next(new AppError("Datos de entrada inválidos", 400, errors));
}
