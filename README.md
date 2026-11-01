# WTWT Movie Explorer — Backend

API REST de **What to Watch Today – Movie Explorer**, una plataforma full-stack para explorar, reseñar y rankear películas, animes y series geek.

**Contenido:** [Descripción](#descripción-del-proyecto) · [Enlaces](#enlaces) · [Tecnologías](#tecnologías) · [Estructura](#estructura-del-proyecto) · [Instalación](#instalación-y-ejecución) · [Variables de entorno](#variables-de-entorno) · [API](#documentación-y-uso-de-la-api) · [Reglas de negocio](#reglas-de-negocio) · [Seguridad](#seguridad) · [Despliegue](#despliegue) · [Principios](#principios-de-diseño-aplicados) · [Créditos](#créditos)

## Descripción del proyecto

La temática es el entretenimiento geek (anime, ciencia ficción, superhéroes y fantasía). Hoy la información de un título está dispersa entre fichas, reseñas y puntuaciones de distintos sitios; este proyecto la reúne en un solo lugar y la hace comparable.

Funcionalidades principales:

- Registro e inicio de sesión con JWT, y dos roles: `usuario` y `admin`.
- Catálogo de títulos con categorías, paginación y filtro por categoría.
- Propuesta de títulos por usuarios, con aprobación del administrador y rechazo de duplicados.
- Reseñas con calificación de 1 a 10 y votos de utilidad (like/dislike).
- Ranking ponderado por calificaciones, votos y antigüedad de las reseñas.

## Enlaces

| Recurso | URL |
| --- | --- |
| Repositorio del frontend | https://github.com/lucaspajarito01/wtwt_movie_explorer_frontend |
| Frontend desplegado | https://lucaspajarito01.github.io/wtwt_movie_explorer_frontend/ |
| **Swagger UI (producción)** | `https://wtwt-movie-explorer-backend.onrender.com//api/docs` |
| Swagger UI (local) | http://localhost:3000/api/docs |
| API en producción | `https://wtwt-movie-explorer-backend.onrender.com//api/v1` |
| Planeación SCRUM (PDF) | [`https://docs.google.com/document/d/1YN_QN3KYBgQg7BQ0Ag5Bw1df4MVdgfBM/edit?usp=sharing&ouid=105110804751805458228&rtpof=true&sd=true`] |

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Entorno | Node.js 20 o superior, módulos ES (`"type": "module"`) |
| Servidor | Express 5, CORS, dotenv |
| Base de datos | MySQL 8 con `mysql2` (consultas parametrizadas y transacciones) |
| Seguridad | `bcrypt`, `jsonwebtoken`, `passport-jwt`, `express-rate-limit` |
| Validación | `express-validator` |
| Documentación | `swagger-ui-express` (OpenAPI 3) y `semver` para el versionado |
| Gestión | SCRUM en ClickUp, Git con Conventional Commits |

## Estructura del proyecto

```
src/
├── config/        env.js (configuración), db.js (pool y transacciones), passport.js, ranking.js,
│                  database/ (script SQL del esquema)
├── controllers/   Capa HTTP: leen la petición y arman la respuesta
├── services/      Reglas de negocio y control de permisos
├── models/        Acceso a datos (SQL)
├── validators/    Reglas de express-validator por recurso
├── middlewares/   auth, validate, rateLimiter, errorHandler, notFound, apiVersion
├── routes/        index.js y v1/ (un archivo por recurso)
├── docs/          Especificación OpenAPI para Swagger
├── utils/         AppError, roles
├── app.js         Configuración de Express
└── server.js      Arranque y verificación de la base de datos
```

## Instalación y ejecución

**Requisitos:** Node.js 20 o superior, npm y un servidor MySQL 8 accesible.

```bash
git clone https://github.com/lucaspajarito01/wtwt_movie_explorer_backend.git
cd wtwt_movie_explorer_backend
npm install
cp .env.example .env        # completar los valores (ver la siguiente sección)
```

1. **Crear la base de datos.** Ejecutar el script `src/config/database/wtwt_movie_explorer_database.sql` en MySQL. Crea las tablas e inserta los roles `usuario` y `admin`.
2. **Iniciar el servidor:** `npm run dev` (desarrollo, con recarga) o `npm start` (producción).
3. **Verificar:** abrir `http://localhost:3000/api/v1/health` y `http://localhost:3000/api/docs`.
4. **Crear el primer administrador.** El registro público siempre crea `usuario`. Registrar la cuenta por la API y promoverla:

```sql
UPDATE usuarios SET role_id = (SELECT id FROM roles WHERE nombre = 'admin') WHERE correo = 'admin@correo.com';
```

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor con recarga automática (nodemon) |
| `npm start` | Servidor en modo normal |
| `npm run docs:check` | Valida la especificación OpenAPI y sus ejemplos |

## Variables de entorno

Se definen en `.env` (nunca se versiona). `.env.example` contiene la plantilla sin secretos.

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma (sin ruta ni `/` final) | `http://localhost:5500` |
| `DB_HOST` / `DB_PORT` | Servidor y puerto de MySQL | `localhost` / `3306` |
| `DB_USER` / `DB_PASS` | Credenciales de MySQL | `root` / `********` |
| `DB_NAME` | Nombre de la base de datos | `wtwt_movie_explorer_database` |
| `JWT_SECRET` | Secreto de firma (mínimo 32 caracteres en producción) | `********` |
| `JWT_EXPIRES_IN` | Vigencia del token | `1h` |
| `BCRYPT_SALT_ROUNDS` | Rondas de bcrypt | `10` |
| `RATE_LIMIT_WINDOW_MS` | Ventana del límite de peticiones | `900000` |
| `RATE_LIMIT_MAX` | Peticiones por ventana y por IP en toda la API | `100` |
| `AUTH_RATE_LIMIT_MAX` | Intentos por ventana en registro y login | `20` |

Para generar un secreto: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Documentación y uso de la API

La documentación interactiva está en **Swagger UI**: `/api/docs` (local: http://localhost:3000/api/docs) y el JSON OpenAPI en `/api/docs.json`. Para probar rutas protegidas: iniciar sesión, copiar `data.token`, pulsar **Authorize** y pegarlo sin el prefijo `Bearer`.

Todas las rutas cuelgan de `/api/v1`. Las respuestas siguen un formato uniforme:

```json
{ "success": true, "message": "...", "data": {}, "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 } }
{ "success": false, "message": "Datos de entrada inválidos", "errors": [{ "field": "email", "message": "El correo no es válido" }] }
```

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | Público | Estado y versión de la API |
| POST | `/auth/register` | Público | Registro (rol `usuario`) y emisión de JWT |
| POST | `/auth/login` | Público | Inicio de sesión y emisión de JWT |
| GET | `/auth/me` | Usuario | Datos de la sesión actual |
| GET | `/categories`, `/categories/:id` | Público | Consultar categorías |
| POST, PUT, PATCH, DELETE | `/categories`, `/categories/:id` | Admin | Gestionar categorías |
| GET | `/titles` | Público | Listado paginado (`page`, `limit`, `categoryId`, `sort`) |
| GET | `/titles/:id` | Público | Detalle con número de reseñas, promedio y puntaje de ranking |
| POST | `/titles` | Usuario | Proponer un título (queda `pendiente`; el admin lo crea `aprobado`) |
| PATCH | `/titles/:id` | Autor o Admin | Editar (el autor solo mientras esté pendiente) |
| PATCH | `/titles/:id/approve` | Admin | Aprobar un título pendiente |
| DELETE | `/titles/:id` | Admin | Eliminar o rechazar un título |
| POST | `/reviews` | Usuario | Crear una reseña con calificación de 1 a 10 |
| PUT, PATCH, DELETE | `/reviews/:id` | Autor | Modificar o eliminar la propia reseña |
| PUT, DELETE | `/reviews/:id/vote` | Usuario | Votar (`like`/`dislike`) o retirar el voto |

Valores de `sort`: `recent` (por defecto), `ranking`, `rating`, `reviews`, `title`, `year`. Un administrador puede usar `?estado=pendiente|aprobado|todos` en el listado.

Códigos habituales: `400` validación, `401` sin sesión o token inválido, `403` sin permiso, `404` no encontrado, `409` conflicto (duplicado), `429` límite de peticiones.

**Ejemplos con cURL**

```bash
BASE=http://localhost:3000/api/v1
H='Content-Type: application/json'

# 1. Registro (la respuesta incluye data.token)
curl -X POST $BASE/auth/register -H "$H" -d '{"username":"Karen","email":"karen@test.com","password":"Clave1234"}'

# 2. Proponer un título (TOKEN = valor de data.token)
curl -X POST $BASE/titles -H "$H" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Akira","description":"Cyberpunk clásico.","categoryId":1,"year":1988}'

# 3. Listar con filtro y ranking
curl "$BASE/titles?categoryId=1&sort=ranking&page=1&limit=10"

# 4. Reseñar y votar la reseña de otro usuario
curl -X POST $BASE/reviews -H "$H" -H "Authorization: Bearer $TOKEN" -d '{"movieId":1,"rating":9,"comment":"Excelente"}'
curl -X PUT $BASE/reviews/1/vote -H "$H" -H "Authorization: Bearer $TOKEN" -d '{"type":"like"}'
```

## Reglas de negocio

- **Estados de un título:** `pendiente` (visible solo para su autor y los administradores) y `aprobado` (visible para todos).
- **Duplicados:** no pueden existir dos títulos con el mismo nombre y año. La comparación ignora mayúsculas, tildes y espacios repetidos.
- **Votos:** un voto por usuario y reseña, que puede cambiarse; no se puede votar la propia reseña. La operación es una transacción MySQL.
- **Ranking:** `score = (C·m + Σ wᵢ·rᵢ) / (C + Σ wᵢ)`, donde `rᵢ` es la calificación de cada reseña y `wᵢ = factor_votos × decaimiento`.
  - `factor_votos = clamp(1 + 0.25·(likes − dislikes), 0.5, 3)` y `decaimiento = 0.5^(días / 180)`.
  - `C = 3` y `m` es el promedio global de calificaciones (5.5 si no hay reseñas). Los títulos sin reseñas quedan al final.
  - Los parámetros están en `src/config/ranking.js`. El orden es determinista: los empates se resuelven por número de reseñas y luego por id.

## Seguridad

- Contraseñas con hash bcrypt; JWT firmado con HS256 y vigencia limitada.
- Autorización por rol: el rol y el estado de la cuenta se consultan en la base de datos en cada petición.
- Validación de entradas con `express-validator`, lista blanca de campos y consultas SQL parametrizadas.
- Límite de peticiones global y más estricto en registro e inicio de sesión; CORS restringido a los orígenes configurados.
- Errores centralizados, sin exponer trazas en producción; secretos solo en variables de entorno.

## Despliegue

| Componente | Servicio | Notas |
| --- | --- | --- |
| Backend | Render | Comando de inicio `npm start`; variables de entorno configuradas en el panel |
| Base de datos | Aiven (MySQL) | Credenciales en `DB_*`; el esquema se carga con el script SQL |
| Frontend | GitHub Pages | `CORS_ORIGIN` debe incluir `https://lucaspajarito01.github.io` |

El backend confía en el proxy de Render (`trust proxy`) para aplicar el límite de peticiones por IP real. En el plan gratuito el servicio se suspende por inactividad y la primera petición puede tardar.

## Principios de diseño aplicados

- **Separación de responsabilidades:** rutas, controladores, servicios y modelos tienen funciones distintas.
- **DRY:** validadores, respuestas de error y paginación reutilizables; la especificación OpenAPI comparte esquemas.
- **Mínimo privilegio:** rutas protegidas por rol y lista blanca de campos editables.
- **Fallo rápido:** el servidor no arranca sin las variables obligatorias, con una versión no válida o sin conexión a la base de datos.
- **Consistencia de datos:** transacciones en las operaciones de varios pasos y restricciones únicas en la base de datos.
- **Versionado:** API bajo `/api/v1` y versión semver en `package.json` (cabecera `X-API-Version`).

## Créditos

Proyecto desarrollado en Campuslands (Guatemala) con la metodología SCRUM por **Antonio Canux** y **Lucas Pajarito**, bajo la guía de **Eduin Salas** y **Andre López**.
