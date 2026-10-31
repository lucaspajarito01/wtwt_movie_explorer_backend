# wtwt_movie_explorer_backend
Una aplicación full-stack usando Node.js + Express para el backend que permita a los usuarios registrar, calificar y rankear películas, animes y series geek. 

## Documentación de la API

Con el servidor en marcha, la documentación interactiva (Swagger UI) está en
`http://localhost:3000/api/docs` y el JSON OpenAPI en `/api/docs.json`.

Para autenticarte: haz login, copia `data.token`, pulsa **Authorize** y pégalo (sin "Bearer").
Tras cambiar un endpoint, actualiza `src/docs/` y ejecuta `npm run docs:check`.