import config from "../config/env.js";
import { schemas } from "./schemas.js";
import { authPaths } from "./paths/auth.js";
import { categoryPaths } from "./paths/categories.js";
import { healthPaths } from "./paths/health.js";
import { reviewPaths } from "./paths/reviews.js";
import { titlePaths } from "./paths/titles.js";

const description = `
API del proyecto **What to Watch Today – Movie Explorer**: catálogo de películas, animes y series
con reseñas, calificaciones de 1 a 10, votos de utilidad y un ranking ponderado.

## Cómo autenticarte en esta página
1. Crea una cuenta con \`POST /auth/register\` o inicia sesión con \`POST /auth/login\`.
2. Copia el valor de \`data.token\` de la respuesta.
3. Pulsa **Authorize**, pega el token (sin escribir "Bearer") y confirma.

Las rutas con candado requieren sesión. Las de administrador devuelven \`403\` a un usuario normal.

## Formato de las respuestas
- Éxito: \`{ "success": true, "message": "...", "data": ... }\`. Los listados añaden \`meta\` con la paginación.
- Error: \`{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }\`
  (\`errors\` solo aparece en errores de validación, con código 400).

## Límite de peticiones
Hay un límite general por IP y uno más estricto para registro y login. Al superarlo se responde \`429\`
con la cabecera \`Retry-After\`.

## Ranking ponderado
\`score = (C · m + Σ wᵢ · rᵢ) / (C + Σ wᵢ)\`

- \`rᵢ\`: calificación (1–10) de cada reseña del título.
- \`wᵢ = factor_votos × decaimiento\`, donde \`factor_votos = clamp(1 + 0.25 · (likes − dislikes), 0.5, 3)\`
  y \`decaimiento = 0.5 ^ (días desde la reseña / 180)\`.
- \`C = 3\` y \`m\` es el promedio de todas las reseñas (5.5 si aún no hay ninguna).
- Sin reseñas: \`score = null\` y el título queda al final. Es determinista: mismos datos y mismo día, mismo orden.

## Estados de un título
\`pendiente\` (propuesto por un usuario, visible solo para su autor y los administradores) y
\`aprobado\` (visible para todos). Un administrador aprueba con \`PATCH /titles/{id}/approve\`.
`.trim();

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "What to Watch Today – Movie Explorer API",
    version: config.version,
    description,
  },
  servers: [{ url: config.apiPrefix, description: "Servidor actual" }],
  tags: [
    { name: "Health", description: "Estado del servicio" },
    { name: "Auth", description: "Registro, inicio de sesión y sesión actual" },
    { name: "Categorías", description: "Consulta pública; gestión solo para administradores" },
    { name: "Títulos", description: "Catálogo: listado, filtros, ranking, alta, edición y aprobación" },
    { name: "Reseñas", description: "Reseñas con calificación de 1 a 10 (solo el autor las modifica)" },
    { name: "Votos", description: "Likes y dislikes sobre reseñas ajenas" },
  ],
  paths: {
    ...healthPaths,
    ...authPaths,
    ...categoryPaths,
    ...titlePaths,
    ...reviewPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token obtenido en `/auth/login` o `/auth/register`",
      },
    },
    schemas,
  },
};

export default openapi;
