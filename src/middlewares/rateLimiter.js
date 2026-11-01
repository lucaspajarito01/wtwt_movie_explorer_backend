import rateLimit from 'express-rate-limit';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';

const build = ({ limit, message }) =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Pasa el error por el errorHandler para mantener el formato JSON del proyecto
    handler: (req, res, next) => next(new AppError(message, 429)),
  });

// Límite general para toda la API
export const apiLimiter = build({
  limit: config.rateLimit.max,
  message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
});

// Límite estricto para login y registro (frena fuerza bruta y spam de cuentas)
export const authLimiter = build({
  limit: config.rateLimit.authMax,
  message: 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.',
});