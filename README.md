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
