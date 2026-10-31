import {
  badRequest,
  bearer,
  envelope,
  err,
  forbidden,
  idParam,
  ok,
  ref,
  requestBody,
  unauthorized,
} from "../helpers.js";

const anime = { id: 1, name: "Anime", description: "Series y películas de animación japonesa" };
const scifi = { id: 2, name: "Ciencia ficción", description: null };
const notFound = err("La categoría no existe", "Categoría no encontrada");
const duplicate = err("Ya existe una categoría con ese nombre", "Ya existe una categoría con ese nombre");
const idErrors = badRequest([{ field: "id", message: "El parámetro id debe ser un entero positivo" }]);

export const categoryPaths = {
  "/categories": {
    get: {
      tags: ["Categorías"],
      operationId: "listCategories",
      summary: "Listar categorías",
      description: "Pública. Sirve para llenar el filtro del listado y los formularios. Orden alfabético.",
      security: [],
      responses: {
        200: ok("Lista de categorías", envelope({ type: "array", items: ref("Category") }, { message: false }), {
          success: true,
          data: [anime, scifi],
        }),
      },
    },
    post: {
      tags: ["Categorías"],
      operationId: "createCategory",
      summary: "Crear una categoría",
      description: "Solo administrador. El nombre es obligatorio, único y de hasta 50 caracteres.",
      security: bearer,
      requestBody: requestBody("CategoryInput", {
        completa: { summary: "Con descripción", value: { name: "Anime", description: "Series y películas de animación japonesa" } },
        minima: { summary: "Solo nombre", value: { name: "Fantasía" } },
      }),
      responses: {
        201: ok("Categoría creada", envelope(ref("Category")), {
          success: true,
          message: "Categoría creada correctamente",
          data: anime,
        }),
        400: badRequest([{ field: "name", message: "El nombre es obligatorio" }]),
        401: unauthorized,
        403: forbidden,
        409: duplicate,
      },
    },
  },
  "/categories/{id}": {
    get: {
      tags: ["Categorías"],
      operationId: "getCategory",
      summary: "Consultar una categoría",
      security: [],
      parameters: [idParam("Id de la categoría")],
      responses: {
        200: ok("Categoría encontrada", envelope(ref("Category"), { message: false }), { success: true, data: anime }),
        400: idErrors,
        404: notFound,
      },
    },
    put: {
      tags: ["Categorías"],
      operationId: "replaceCategory",
      summary: "Reemplazar una categoría",
      description: "Solo administrador. Exige el nombre; la descripción es opcional (si no se envía, se limpia).",
      security: bearer,
      parameters: [idParam("Id de la categoría")],
      requestBody: requestBody("CategoryInput", {
        ejemplo: { summary: "Reemplazo completo", value: { name: "Anime y manga", description: "Contenido de origen japonés" } },
      }),
      responses: {
        200: ok("Categoría actualizada", envelope(ref("Category")), {
          success: true,
          message: "Categoría actualizada correctamente",
          data: { id: 1, name: "Anime y manga", description: "Contenido de origen japonés" },
        }),
        400: badRequest([{ field: "name", message: "El nombre es obligatorio" }]),
        401: unauthorized,
        403: forbidden,
        404: notFound,
        409: duplicate,
      },
    },
    patch: {
      tags: ["Categorías"],
      operationId: "updateCategory",
      summary: "Actualizar parcialmente una categoría",
      description: "Solo administrador. Envía al menos `name` o `description`.",
      security: bearer,
      parameters: [idParam("Id de la categoría")],
      requestBody: requestBody("CategoryPatch", {
        soloDescripcion: { summary: "Cambiar la descripción", value: { description: "Contenido de origen japonés" } },
      }),
      responses: {
        200: ok("Categoría actualizada", envelope(ref("Category")), {
          success: true,
          message: "Categoría actualizada correctamente",
          data: { id: 1, name: "Anime", description: "Contenido de origen japonés" },
        }),
        400: badRequest([{ field: "", message: "Debes proporcionar al menos el nombre o la descripción" }]),
        401: unauthorized,
        403: forbidden,
        404: notFound,
        409: duplicate,
      },
    },
    delete: {
      tags: ["Categorías"],
      operationId: "deleteCategory",
      summary: "Eliminar una categoría",
      description: "Solo administrador. Los títulos que la usaban quedan sin categoría.",
      security: bearer,
      parameters: [idParam("Id de la categoría")],
      responses: {
        200: ok("Categoría eliminada", envelope(null), { success: true, message: "Categoría eliminada correctamente" }),
        400: idErrors,
        401: unauthorized,
        403: forbidden,
        404: notFound,
      },
    },
  },
};
