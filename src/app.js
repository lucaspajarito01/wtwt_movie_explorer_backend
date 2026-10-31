import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import passport from "./config/passport.js";
import apiVersion from './middlewares/apiVersion.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import swaggerUi from "swagger-ui-express";
import openapi from "./docs/openapi.js";

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(apiVersion);

// Así no cuenta para el límite de peticiones de la API.
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: "WTWT Movie Explorer – API",
    swaggerOptions: {
      persistAuthorization: true, // el token sobrevive a recargar la página
      displayRequestDuration: true,
    },
  }),
);
app.get("/api/docs.json", (req, res) => res.json(openapi)); // importable en Postman/Insomnia

app.use(config.apiPrefix, apiLimiter);   // límite global solo sobre /api/v1
app.use(express.json());
app.use(passport.initialize());

app.use(config.apiPrefix, routes);

app.use(notFound);
app.use(errorHandler);

export default app;