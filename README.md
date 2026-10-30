# wtwt_movie_explorer_backend
Una aplicación full-stack usando Node.js + Express para el backend que permita a los usuarios registrar, calificar y rankear películas, animes y series geek. 

## Reseñas

Todas las rutas de reseñas requieren autenticación. Cada usuario solo puede editar o eliminar sus propias reseñas.

| Método | Ruta | Acción |
| --- | --- | --- |
| POST | `/api/v1/reviews` | Crear (`movieId`, `rating` y opcionalmente `title`, `comment`) |
| PUT | `/api/v1/reviews/:id` | Reemplazar la calificación y opcionalmente el título y el comentario |
| PATCH | `/api/v1/reviews/:id` | Actualizar la calificación, el título o el comentario |
| DELETE | `/api/v1/reviews/:id` | Eliminar |

La calificación debe ser un entero de 1 a 10. Se responde `400` ante datos inválidos, `401` si falta o no es válido el token, `403` si se intenta modificar una reseña ajena y `404` si no existe la reseña o la película indicada.
