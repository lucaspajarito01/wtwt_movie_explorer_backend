import {
  badRequest,
  bearer,
  envelope,
  err,
  idParam,
  ok,
  ref,
  requestBody,
  unauthorized,
} from "../helpers.js";

const review = {
  id: 15,
  movieId: 7,
  userId: 3,
  title: "Un clásico imprescindible",
  comment: "Una historia que te hace pensar mucho.",
  rating: 9,
  createdAt: "2026-10-30T15:20:00.000Z",
};
const reviewNotFound = err("La reseña no existe", "Reseña no encontrada");
const notOwner = err(
  "La reseña es de otro usuario",
  "No tienes permisos para modificar esta reseña",
);
const notOwnerDelete = err(
  "La reseña es de otro usuario y quien llama no es admin",
  "No tienes permisos para eliminar esta reseña",
);
const ratingError = badRequest([
  { field: "rating", message: "La calificación debe ser un entero entre 1 y 10" },
]);

export const reviewPaths = {
  "/reviews": {
    post: {
      tags: ["Reseñas"],
      operationId: "createReview",
      summary: "Crear una reseña con calificación",
      description:
        "Usuario autenticado. `movieId` es el id del título reseñado. La calificación es un entero de 1 a 10.",
      security: bearer,
      requestBody: requestBody("ReviewCreate", {
        completa: {
          summary: "Con título y comentario",
          value: { movieId: 7, rating: 9, title: "Un clásico imprescindible", comment: "Una historia que te hace pensar mucho." },
        },
        minima: { summary: "Solo calificación", value: { movieId: 7, rating: 8 } },
      }),
      responses: {
        201: ok("Reseña creada", envelope(ref("Review")), {
          success: true,
          message: "Reseña creada correctamente",
          data: review,
        }),
        400: ratingError,
        401: unauthorized,
        404: err("El título no existe", "Película no encontrada"),
      },
    },
  },
  "/reviews/{id}": {
    put: {
      tags: ["Reseñas"],
      operationId: "replaceReview",
      summary: "Reemplazar mi reseña",
      description: "Solo el autor. Exige la calificación; título y comentario son opcionales.",
      security: bearer,
      parameters: [idParam("Id de la reseña")],
      requestBody: requestBody("ReviewReplace", {
        ejemplo: { summary: "Reemplazo", value: { rating: 8, title: "Revisada", comment: "Me gustó más la segunda vez." } },
      }),
      responses: {
        200: ok("Reseña actualizada", envelope(ref("Review")), {
          success: true,
          message: "Reseña actualizada correctamente",
          data: { ...review, rating: 8, title: "Revisada", comment: "Me gustó más la segunda vez." },
        }),
        400: ratingError,
        401: unauthorized,
        403: notOwner,
        404: reviewNotFound,
      },
    },
    patch: {
      tags: ["Reseñas"],
      operationId: "updateReview",
      summary: "Editar parcialmente mi reseña",
      description: "Solo el autor. Envía al menos uno de `rating`, `title` o `comment`.",
      security: bearer,
      parameters: [idParam("Id de la reseña")],
      requestBody: requestBody("ReviewPatch", {
        soloNota: { summary: "Cambiar la calificación", value: { rating: 10 } },
      }),
      responses: {
        200: ok("Reseña actualizada", envelope(ref("Review")), {
          success: true,
          message: "Reseña actualizada correctamente",
          data: { ...review, rating: 10 },
        }),
        400: ratingError,
        401: unauthorized,
        403: notOwner,
        404: reviewNotFound,
      },
    },
    delete: {
      tags: ["Reseñas"],
      operationId: "deleteReview",
      summary: "Eliminar una reseña",
      description: "El autor o un administrador (moderación). También se eliminan los votos recibidos.",
      security: bearer,
      parameters: [idParam("Id de la reseña")],
      responses: {
        200: ok("Reseña eliminada", envelope(null), { success: true, message: "Reseña eliminada correctamente" }),
        401: unauthorized,
        403: notOwnerDelete,
        404: reviewNotFound,
      },
    },
  },
  "/reviews/{id}/vote": {
    put: {
      tags: ["Votos"],
      operationId: "voteReview",
      summary: "Dar like o dislike a una reseña",
      description:
        "Usuario autenticado. **Un voto por usuario y reseña**: repetir el mismo voto no cambia nada y " +
        "enviar el contrario lo cambia. No se puede votar la propia reseña. " +
        "La operación es una transacción MySQL y devuelve los conteos actualizados.",
      security: bearer,
      parameters: [idParam("Id de la reseña")],
      requestBody: requestBody("VoteInput", {
        like: { summary: "Like", value: { type: "like" } },
        dislike: { summary: "Dislike", value: { type: "dislike" } },
      }),
      responses: {
        200: ok("Voto registrado", envelope(ref("VoteSummary")), {
          success: true,
          message: "Voto registrado correctamente",
          data: { reviewId: 15, likes: 4, dislikes: 1, userVote: "like" },
        }),
        400: badRequest([{ field: "type", message: "type debe ser 'like' o 'dislike'" }]),
        401: unauthorized,
        403: err("Es tu propia reseña", "No puedes votar tu propia reseña"),
        404: reviewNotFound,
      },
    },
    delete: {
      tags: ["Votos"],
      operationId: "unvoteReview",
      summary: "Retirar mi voto",
      description: "Idempotente: si no había voto, responde igual con el estado actual.",
      security: bearer,
      parameters: [idParam("Id de la reseña")],
      responses: {
        200: ok("Voto retirado", envelope(ref("VoteSummary")), {
          success: true,
          message: "Voto retirado correctamente",
          data: { reviewId: 15, likes: 3, dislikes: 1, userVote: null },
        }),
        401: unauthorized,
        403: err("Es tu propia reseña", "No puedes votar tu propia reseña"),
        404: reviewNotFound,
      },
    },
  },
};
