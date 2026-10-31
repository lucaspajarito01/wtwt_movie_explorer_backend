import {
  badRequest,
  bearer,
  envelope,
  err,
  forbidden,
  idParam,
  ok,
  optionalBearer,
  ref,
  requestBody,
  unauthorized,
} from "../helpers.js";

const eva = {
  id: 7,
  title: "Neon Genesis Evangelion",
  description: "Anime de mechas y drama psicológico.",
  year: 1995,
  duration: "24 min por episodio",
  ageRating: "+16",
  posterUrl: "https://example.com/eva-poster.jpg",
  bannerUrl: null,
  trailerUrl: null,
  status: "aprobado",
  createdBy: 1,
  categoryId: 1,
  category: "Anime",
  director: "Hideaki Anno",
  platform: "Netflix",
  language: "Japonés",
  reviewCount: 12,
  avgRating: 8.6,
  score: 8.31,
};
const akira = {
  ...eva,
  id: 8,
  title: "Akira",
  description: "Cyberpunk clásico.",
  year: 1988,
  duration: null,
  ageRating: null,
  posterUrl: null,
  director: null,
  platform: null,
  language: null,
  reviewCount: 0,
  avgRating: null,
  score: null,
};
const pendiente = { ...akira, id: 9, title: "Ghost in the Shell", year: 1995, status: "pendiente", createdBy: 3 };

const notFound = err("El título no existe (o está pendiente y no es tuyo)", "Título no encontrado");
const duplicate = err(
  "Ya existe un título con el mismo nombre y año (sin distinguir mayúsculas, tildes ni espacios repetidos)",
  "Ya existe un título con ese nombre y año",
);
const idErrors = badRequest([{ field: "id", message: "El parámetro id debe ser un entero positivo" }]);

export const titlePaths = {
  "/titles": {
    get: {
      tags: ["Títulos"],
      operationId: "listTitles",
      summary: "Listar títulos (paginado, con filtro y ranking)",
      description:
        "Pública: solo devuelve títulos `aprobado`. Cada título incluye `reviewCount`, `avgRating` y `score`.\n\n" +
        "Con `sort=ranking` se ordena por el **puntaje ponderado** descrito en la introducción; " +
        "los títulos sin reseñas quedan al final y los empates se resuelven por número de reseñas y luego por id.\n\n" +
        "Con token de **administrador**, el parámetro `estado` permite ver los pendientes " +
        "(para cualquier otro usuario se ignora).",
      security: optionalBearer,
      parameters: [
        { name: "page", in: "query", description: "Página (desde 1)", schema: { type: "integer", minimum: 1, default: 1 } },
        { name: "limit", in: "query", description: "Resultados por página", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } },
        { name: "categoryId", in: "query", description: "Filtra por categoría", schema: { type: "integer", minimum: 1 }, example: 1 },
        {
          name: "sort",
          in: "query",
          description:
            "`recent` (más nuevos), `ranking` (puntaje ponderado), `rating` (promedio simple), " +
            "`reviews` (más reseñados), `title` (A–Z), `year` (año descendente)",
          schema: { type: "string", enum: ["recent", "ranking", "rating", "reviews", "title", "year"], default: "recent" },
        },
        {
          name: "estado",
          in: "query",
          description: "Solo administrador: `aprobado` (por defecto), `pendiente` o `todos`",
          schema: { type: "string", enum: ["aprobado", "pendiente", "todos"], default: "aprobado" },
        },
      ],
      responses: {
        200: ok("Página de títulos", envelope({ type: "array", items: ref("Title") }, { message: false, meta: true }), {
          success: true,
          data: [eva, akira],
          meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
        }),
        400: badRequest([{ field: "sort", message: "sort debe ser uno de: recent, ranking, rating, reviews, title, year" }]),
        401: unauthorized,
      },
    },
    post: {
      tags: ["Títulos"],
      operationId: "createTitle",
      summary: "Crear o proponer un título",
      description:
        "Cualquier usuario autenticado. Si lo crea un **administrador** nace `aprobado`; " +
        "si lo crea un usuario normal queda `pendiente` hasta que un administrador lo apruebe.\n\n" +
        "`director`, `platform` y `language` se envían como **nombre** (se crean si no existen).\n\n" +
        "**Duplicados:** no se permiten dos títulos con el mismo nombre y año; la comparación ignora " +
        "mayúsculas, tildes y espacios repetidos.",
      security: bearer,
      requestBody: requestBody("TitleCreate", {
        minimo: {
          summary: "Solo campos obligatorios",
          value: { title: "Akira", description: "Cyberpunk clásico.", categoryId: 1, year: 1988 },
        },
        completo: {
          summary: "Con campos opcionales",
          value: {
            title: "Neon Genesis Evangelion",
            description: "Anime de mechas y drama psicológico.",
            categoryId: 1,
            year: 1995,
            duration: "24 min por episodio",
            ageRating: "+16",
            director: "Hideaki Anno",
            platform: "Netflix",
            language: "Japonés",
            posterUrl: "https://example.com/eva-poster.jpg",
          },
        },
      }),
      responses: {
        201: ok("Título creado (o enviado a aprobación)", envelope(ref("Title")), {
          success: true,
          message: "Título enviado; quedará visible cuando un administrador lo apruebe",
          data: pendiente,
        }),
        400: badRequest([
          { field: "title", message: "El título es obligatorio" },
          { field: "year", message: "El año debe estar entre 1888 y 2031" },
          { field: "posterUrl", message: "El póster debe ser una URL http(s) válida" },
        ]),
        401: unauthorized,
        409: duplicate,
      },
    },
  },
  "/titles/{id}": {
    get: {
      tags: ["Títulos"],
      operationId: "getTitle",
      summary: "Detalle de un título",
      description:
        "Los `aprobado` los ve cualquiera. Un `pendiente` solo lo ven su autor y los administradores " +
        "(para los demás responde 404).",
      security: optionalBearer,
      parameters: [idParam("Id del título")],
      responses: {
        200: ok("Título encontrado", envelope(ref("Title"), { message: false }), { success: true, data: eva }),
        400: idErrors,
        401: unauthorized,
        404: notFound,
      },
    },
    patch: {
      tags: ["Títulos"],
      operationId: "updateTitle",
      summary: "Editar un título",
      description:
        "El **administrador** edita cualquiera. El **autor** solo edita el suyo mientras esté `pendiente`. " +
        "El estado no se puede cambiar aquí (usa `/titles/{id}/approve`). Enviar `null` en un campo opcional lo borra.",
      security: bearer,
      parameters: [idParam("Id del título")],
      requestBody: requestBody("TitleUpdate", {
        anio: { summary: "Corregir el año", value: { year: 1996 } },
        borrar: { summary: "Borrar el director", value: { director: null } },
      }),
      responses: {
        200: ok("Título actualizado", envelope(ref("Title")), {
          success: true,
          message: "Título actualizado correctamente",
          data: { ...eva, year: 1996 },
        }),
        400: badRequest([{ field: "", message: "Debes enviar al menos un campo para actualizar" }]),
        401: unauthorized,
        403: err("Solo el autor (si está pendiente) o un administrador puede editarlo", "No tienes permisos para editar este título"),
        404: notFound,
        409: duplicate,
      },
    },
    delete: {
      tags: ["Títulos"],
      operationId: "deleteTitle",
      summary: "Eliminar o rechazar un título",
      description:
        "Solo administrador. Sirve para rechazar un pendiente o retirar un título. " +
        "**También se eliminan sus reseñas y los votos de esas reseñas.**",
      security: bearer,
      parameters: [idParam("Id del título")],
      responses: {
        200: ok("Título eliminado", envelope(null), { success: true, message: "Título eliminado correctamente" }),
        400: idErrors,
        401: unauthorized,
        403: forbidden,
        404: err("El título no existe", "Título no encontrado"),
      },
    },
  },
  "/titles/{id}/approve": {
    patch: {
      tags: ["Títulos"],
      operationId: "approveTitle",
      summary: "Aprobar un título pendiente",
      description: "Solo administrador. Sin cuerpo. Tras aprobarlo aparece en el listado público.",
      security: bearer,
      parameters: [idParam("Id del título")],
      responses: {
        200: ok("Título aprobado", envelope(ref("Title")), {
          success: true,
          message: "Título aprobado correctamente",
          data: { ...pendiente, status: "aprobado" },
        }),
        400: idErrors,
        401: unauthorized,
        403: forbidden,
        404: err("El título no existe", "Título no encontrado"),
        409: err("El título ya estaba aprobado", "El título ya está aprobado"),
      },
    },
  },
};
