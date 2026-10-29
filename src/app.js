import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import passport from "./config/passport.js";
import apiVersion from './middlewares/apiVersion.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

const app = express();

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(apiVersion);
app.use(config.apiPrefix, apiLimiter);   // límite global solo sobre /api/v1
app.use(express.json());
app.use(passport.initialize());

app.use(config.apiPrefix, routes);

app.use(notFound);
app.use(errorHandler);

export default app;