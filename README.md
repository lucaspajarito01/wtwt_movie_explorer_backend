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
