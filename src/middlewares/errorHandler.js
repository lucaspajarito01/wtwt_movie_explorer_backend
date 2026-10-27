import config from '../config/env.js';

export default function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message;

  // si el JSON esta mal formado en el body
  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  }

  if (status >= 500) console.error(err);

  const body = {
    success: false,
    message:
      status >= 500 && config.env === 'production'
        ? 'Error interno del servidor'
        : message,
  };

  if (err.errors) body.errors = err.errors;
  if (status >= 500 && config.env !== 'production') body.stack = err.stack;

  res.status(status).json(body);
}