import { param, query } from 'express-validator';

// Valida y convierte a número un parámetro de ruta tipo /titles/:id
export const idParam = (name = 'id') =>
  param(name)
    .isInt({ min: 1 }).withMessage(`El parámetro ${name} debe ser un entero positivo`)
    .toInt();

// Paginación con límite razonable (lo exige ME-14)
export const paginationRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('limit debe estar entre 1 y 50')
    .toInt(),
];