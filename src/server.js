import app from './app.js';
import config from './config/env.js';

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}${config.apiPrefix} [${config.env}]`);
});