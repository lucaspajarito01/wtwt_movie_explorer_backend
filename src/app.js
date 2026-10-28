import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import routes from './routes/index.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';
import passport from "./config/passport.js";

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use(config.apiPrefix, routes);

app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.use(config.apiPrefix, routes);

app.use(notFound);
app.use(errorHandler);

export default app;