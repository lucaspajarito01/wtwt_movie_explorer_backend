# wtwt_movie_explorer_backend
Una aplicación full-stack usando Node.js + Express para el backend que permita a los usuarios registrar, calificar y rankear películas, animes y series geek. 

## Documentación de la API

Con el servidor en marcha, la documentación interactiva (Swagger UI) está en
`http://localhost:3000/api/docs` y el JSON OpenAPI en `/api/docs.json`.

Para autenticarte: haz login, copia `data.token`, pulsa **Authorize** y pégalo (sin "Bearer").
Tras cambiar un endpoint, actualiza `src/docs/` y ejecuta `npm run docs:check`.

## Programación orientada a objetos

Las entidades del dominio son clases (`src/entities/`). Las reglas de negocio viven en ellas, el acceso a datos
en repositorios y los casos de uso en servicios; todo se ensambla en `src/container.js`.

| Principio | Dónde se ve |
|---|---|
| **Abstracción** | `BaseEntity` y `BaseRepository` son abstractas: no se instancian y definen el contrato común. |
| **Herencia** | `User`, `Title`, `Category`, `Review` y `Vote` extienden `BaseEntity`; cada `*Repository` extiende `BaseRepository`. |
| **Encapsulamiento** | Campos privados (`#passwordHash`, `#rating`…). El hash solo sale por `toPersistence()` y nunca por `toJSON()`. |
| **Polimorfismo** | Cada entidad implementa su propio `toJSON()`; `User` además ofrece `toSession()`. |
| **Inyección de dependencias** | Los servicios reciben repositorios y la función de transacción por constructor (ver `tests/services/`). |

Reglas en las entidades: `Review.assertEditableBy/assertDeletableBy/assertVotableBy`, `User.isAdmin/isActive/verifyPassword`, `Title.propose/approve/isVisibleTo/assertEditableBy`, `Vote.cast` (solo like/dislike).

## Pruebas

`npm test` ejecuta las pruebas con el runner nativo de Node (no necesitan MySQL).
