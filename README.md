# wtwt_movie_explorer_backend
Una aplicación full-stack usando Node.js + Express para el backend que permita a los usuarios registrar, calificar y rankear películas, animes y series geek. 

## Categorías

Todas las rutas de categorías requieren un token Bearer de un usuario con rol `admin`:

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/v1/categories` | Listar categorías |
| GET | `/api/v1/categories/:id` | Consultar una categoría |
| POST | `/api/v1/categories` | Crear (`name`, opcionalmente `description`) |
| PUT | `/api/v1/categories/:id` | Reemplazar el nombre y opcionalmente la descripción |
| PATCH | `/api/v1/categories/:id` | Actualizar el nombre o la descripción |
| DELETE | `/api/v1/categories/:id` | Eliminar |

El nombre es obligatorio, único y admite hasta 50 caracteres. Las rutas responden `401` si falta o no es válido el token, `403` si el usuario no es administrador, `404` si la categoría no existe y `409` si el nombre ya está en uso.


## Títulos

| Método | Ruta | Acceso | Acción |
| --- | --- | --- | --- |
| GET | `/api/v1/titles?page=1&limit=10` | Público | Lista paginada de títulos aprobados (`limit` máx. 50) |
| GET | `/api/v1/titles/:id` | Público | Detalle (los pendientes solo los ven su autor y los admins) |
| POST | `/api/v1/titles` | Usuario autenticado | Proponer un título (queda `pendiente`; si es admin, `aprobado`) |
| PATCH | `/api/v1/titles/:id` | Autor (solo si está pendiente) o admin | Editar campos |
| PATCH | `/api/v1/titles/:id/approve` | Admin | Aprueba un título pendiente (409 si ya estaba aprobado) |
| DELETE | `/api/v1/titles/:id` | Admin | Elimina/rechaza un título (borra también sus reseñas) |

**Regla de duplicados:** no se permiten dos títulos con el mismo nombre y año. La comparación ignora
mayúsculas/minúsculas y tildes, y se colapsan los espacios repetidos. Un duplicado responde `409`.

Obligatorios al crear: `title`, `description`, `categoryId`, `year`.
Opcionales: `duration`, `ageRating`, `director`, `platform`, `language`, `posterUrl`, `bannerUrl`, `trailerUrl` (`null` borra el valor al editar).
Admin: `?estado=pendiente|aprobado|todos` en el listado.

## Reseñas

Todas las rutas de reseñas requieren autenticación con un token Bearer. Cada usuario puede crear reseñas para películas existentes y solo puede editar o eliminar sus propias reseñas.

| Método | Ruta | Acción |
| --- | --- | --- |
| POST | `/api/v1/reviews` | Crear una reseña |
| PUT | `/api/v1/reviews/:id` | Actualizar la reseña (requiere `rating`; `title` y `comment` son opcionales) |
| PATCH | `/api/v1/reviews/:id` | Actualizar uno o más campos |
| DELETE | `/api/v1/reviews/:id` | Eliminar una reseña propia |

Para crear una reseña, envía `movieId` (entero positivo) y `rating` (entero del 1 al 10). `title` y `comment` son opcionales; el título admite hasta 100 caracteres.

```json
{
  "movieId": 1,
  "rating": 9,
  "title": "Una gran película",
  "comment": "Me gustó mucho."
}
```

En una actualización `PATCH`, debes enviar al menos uno de estos campos: `rating`, `title` o `comment`. Las rutas de edición y eliminación responden `403` si la reseña pertenece a otro usuario y `404` si no existe; crear una reseña para una película inexistente también responde `404`.

## Likes y dislikes de reseñas

Los usuarios autenticados pueden votar una vez por reseña. No se puede votar la reseña propia. Enviar el voto opuesto cambia el anterior; repetir el mismo voto no lo duplica.

| Método | Ruta | Acción |
| --- | --- | --- |
| PUT | `/api/v1/reviews/:id/vote` | Registrar un like o dislike |
| DELETE | `/api/v1/reviews/:id/vote` | Retirar el voto propio |

Para votar, envía `type` con el valor `like` o `dislike`:

```json
{
  "type": "like"
}
```

La respuesta incluye `reviewId`, los totales `likes` y `dislikes`, y `userVote` (`"like"`, `"dislike"` o `null`). Votar la propia reseña responde `403`; si la reseña no existe, responde `404`.
