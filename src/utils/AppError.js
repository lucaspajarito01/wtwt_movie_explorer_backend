export default class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Error de reglas del dominio: una entidad se rechaza a sí misma si sus datos no son válidos.
export class ValidationError extends AppError {
  constructor(message, errors = null) {
    super(message, 400, errors);
  }
}
