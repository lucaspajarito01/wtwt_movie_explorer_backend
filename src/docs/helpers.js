// Utilidades para armar el documento OpenAPI sin repetir estructuras.

export const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

// Cuerpo JSON de una petición, con uno o varios ejemplos con nombre
export const requestBody = (schemaName, examples) => ({
  required: true,
  content: { "application/json": { schema: ref(schemaName), examples } },
});

// Envoltorio estándar de la API: { success, message?, data?, meta? }
export const envelope = (data, { message = true, meta = false } = {}) => ({
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    ...(message && { message: { type: "string" } }),
    ...(data && { data }),
    ...(meta && { meta: ref("Meta") }),
  },
  required: ["success"],
});

export const ok = (description, schema, example) => ({
  description,
  content: { "application/json": { schema, example } },
});

// Respuesta de error con el formato real del errorHandler
export const err = (description, message, errors) => ({
  description,
  content: {
    "application/json": {
      schema: ref("Error"),
      example: { success: false, message, ...(errors && { errors }) },
    },
  },
});

export const badRequest = (errors) =>
  err("Datos de entrada inválidos", "Datos de entrada inválidos", errors);

export const unauthorized = err(
  "Sin token, token inválido o expirado",
  "Token inválido o no proporcionado",
);

export const forbidden = err(
  "El usuario no tiene permiso para esta acción",
  "No tienes permisos para realizar esta acción",
);

export const tooManyRequests = {
  description: "Se superó el límite de peticiones (ver cabecera Retry-After)",
  headers: {
    "Retry-After": {
      description: "Segundos que hay que esperar antes de reintentar",
      schema: { type: "integer", example: 840 },
    },
  },
  content: {
    "application/json": {
      schema: ref("Error"),
      example: {
        success: false,
        message: "Demasiadas peticiones. Intenta de nuevo más tarde.",
      },
    },
  },
};

export const idParam = (description) => ({
  name: "id",
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
  example: 1,
});

export const bearer = [{ bearerAuth: [] }];
// Token opcional: sirve sin sesión, y con sesión desbloquea más datos
export const optionalBearer = [{}, { bearerAuth: [] }];
