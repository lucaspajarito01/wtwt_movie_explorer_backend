import { ref } from "./helpers.js";

const nullableString = (extra = {}) => ({ type: "string", nullable: true, ...extra });

const titleFields = {
  title: { type: "string", maxLength: 150, example: "Neon Genesis Evangelion" },
  description: { type: "string", maxLength: 5000, example: "Anime de mechas y drama psicológico." },
  categoryId: { type: "integer", minimum: 1, example: 1 },
  year: { type: "integer", minimum: 1888, example: 1995 },
  duration: nullableString({ maxLength: 50, example: "24 min por episodio" }),
  ageRating: nullableString({ maxLength: 20, example: "+16" }),
  director: nullableString({ maxLength: 30, example: "Hideaki Anno" }),
  platform: nullableString({ maxLength: 30, example: "Netflix" }),
  language: nullableString({ maxLength: 30, example: "Japonés" }),
  posterUrl: nullableString({ format: "uri", maxLength: 255, example: "https://example.com/eva-poster.jpg" }),
  bannerUrl: nullableString({ format: "uri", maxLength: 255, example: "https://example.com/eva-banner.jpg" }),
  trailerUrl: nullableString({ format: "uri", maxLength: 255, example: "https://example.com/eva-trailer" }),
};

export const schemas = {
  Error: {
    type: "object",
    required: ["success", "message"],
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string" },
      errors: {
        type: "array",
        description: "Detalle por campo (solo en errores de validación)",
        items: ref("FieldError"),
      },
    },
  },
  FieldError: {
    type: "object",
    required: ["field", "message"],
    properties: {
      field: { type: "string", example: "email" },
      message: { type: "string", example: "El correo no es válido" },
    },
  },
  Meta: {
    type: "object",
    required: ["page", "limit", "total", "totalPages"],
    properties: {
      page: { type: "integer", example: 1 },
      limit: { type: "integer", example: 10 },
      total: { type: "integer", example: 42 },
      totalPages: { type: "integer", example: 5 },
    },
  },

  // ---------- Auth ----------
  RegisterInput: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", minLength: 2, maxLength: 100, example: "Karen" },
      email: { type: "string", format: "email", maxLength: 100, example: "karen@test.com" },
      password: {
        type: "string",
        minLength: 8,
        maxLength: 72,
        description: "8 a 72 caracteres, con al menos una letra y un número",
        example: "Clave1234",
      },
    },
  },
  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "karen@test.com" },
      password: { type: "string", example: "Clave1234" },
    },
  },
  User: {
    type: "object",
    required: ["id", "username", "email", "role"],
    properties: {
      id: { type: "integer", example: 3 },
      username: { type: "string", example: "Karen" },
      email: { type: "string", format: "email", example: "karen@test.com" },
      role: { type: "string", enum: ["usuario", "admin"], example: "usuario" },
    },
  },
  SessionUser: {
    type: "object",
    required: ["id", "username", "email", "role", "estado"],
    properties: {
      id: { type: "integer", example: 3 },
      username: { type: "string", example: "Karen" },
      email: { type: "string", format: "email", example: "karen@test.com" },
      role: { type: "string", enum: ["usuario", "admin"], example: "usuario" },
      estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
    },
  },
  AuthData: {
    type: "object",
    required: ["user", "token"],
    properties: {
      user: ref("User"),
      token: {
        type: "string",
        description: "JWT. Enviar como `Authorization: Bearer <token>`",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidXN1YXJpbyIsInN1YiI6IjMifQ.firma",
      },
    },
  },

  // ---------- Categorías ----------
  Category: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", maxLength: 50, example: "Anime" },
      description: nullableString({ example: "Series y películas de animación japonesa" }),
    },
  },
  CategoryInput: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", maxLength: 50, example: "Anime" },
      description: nullableString({ example: "Series y películas de animación japonesa" }),
    },
  },
  CategoryPatch: {
    type: "object",
    minProperties: 1,
    properties: {
      name: { type: "string", maxLength: 50, example: "Anime y manga" },
      description: nullableString({ example: "Contenido de origen japonés" }),
    },
  },

  // ---------- Títulos ----------
  Title: {
    type: "object",
    required: ["id", "title", "status", "reviewCount"],
    properties: {
      id: { type: "integer", example: 7 },
      title: titleFields.title,
      description: { ...titleFields.description, nullable: true },
      year: { type: "integer", nullable: true, example: 1995 },
      duration: titleFields.duration,
      ageRating: titleFields.ageRating,
      posterUrl: titleFields.posterUrl,
      bannerUrl: titleFields.bannerUrl,
      trailerUrl: titleFields.trailerUrl,
      status: {
        type: "string",
        enum: ["pendiente", "aprobado"],
        description: "Solo los `aprobado` aparecen en el listado público",
        example: "aprobado",
      },
      createdBy: { type: "integer", nullable: true, example: 1 },
      categoryId: { type: "integer", nullable: true, example: 1 },
      category: nullableString({ example: "Anime" }),
      director: titleFields.director,
      platform: titleFields.platform,
      language: titleFields.language,
      reviewCount: { type: "integer", example: 12 },
      avgRating: {
        type: "number",
        nullable: true,
        description: "Promedio simple de calificaciones (1 decimal). `null` si no hay reseñas",
        example: 8.6,
      },
      score: {
        type: "number",
        nullable: true,
        description: "Puntaje del ranking ponderado (2 decimales). `null` si no hay reseñas",
        example: 8.31,
      },
    },
  },
  TitleCreate: {
    type: "object",
    required: ["title", "description", "categoryId", "year"],
    properties: titleFields,
  },
  TitleUpdate: {
    type: "object",
    minProperties: 1,
    description: "Cualquier subconjunto de campos. Enviar `null` en un campo opcional lo borra.",
    properties: titleFields,
  },

  // ---------- Reseñas y votos ----------
  Review: {
    type: "object",
    required: ["id", "movieId", "userId", "rating"],
    properties: {
      id: { type: "integer", example: 15 },
      movieId: { type: "integer", description: "Id del título reseñado", example: 7 },
      userId: { type: "integer", description: "Autor de la reseña", example: 3 },
      title: nullableString({ maxLength: 100, example: "Un clásico imprescindible" }),
      comment: nullableString({ example: "Una historia que te hace pensar mucho." }),
      rating: { type: "integer", minimum: 1, maximum: 10, example: 9 },
      createdAt: { type: "string", format: "date-time", example: "2026-10-30T15:20:00.000Z" },
    },
  },
  ReviewCreate: {
    type: "object",
    required: ["movieId", "rating"],
    properties: {
      movieId: { type: "integer", minimum: 1, example: 7 },
      rating: { type: "integer", minimum: 1, maximum: 10, example: 9 },
      title: nullableString({ maxLength: 100, example: "Un clásico imprescindible" }),
      comment: nullableString({ example: "Una historia que te hace pensar mucho." }),
    },
  },
  ReviewReplace: {
    type: "object",
    required: ["rating"],
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 10, example: 8 },
      title: nullableString({ maxLength: 100, example: "Revisada tras verla otra vez" }),
      comment: nullableString({ example: "Me gustó todavía más la segunda vez." }),
    },
  },
  ReviewPatch: {
    type: "object",
    minProperties: 1,
    properties: {
      rating: { type: "integer", minimum: 1, maximum: 10, example: 10 },
      title: nullableString({ maxLength: 100 }),
      comment: nullableString(),
    },
  },
  VoteInput: {
    type: "object",
    required: ["type"],
    properties: { type: { type: "string", enum: ["like", "dislike"], example: "like" } },
  },
  VoteSummary: {
    type: "object",
    required: ["reviewId", "likes", "dislikes", "userVote"],
    properties: {
      reviewId: { type: "integer", example: 15 },
      likes: { type: "integer", example: 4 },
      dislikes: { type: "integer", example: 1 },
      userVote: {
        type: "string",
        enum: ["like", "dislike", null],
        nullable: true,
        description: "Voto del usuario autenticado en esta reseña (`null` si no ha votado)",
        example: "like",
      },
    },
  },
};
