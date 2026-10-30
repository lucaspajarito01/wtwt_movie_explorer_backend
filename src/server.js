import app from './app.js';
import config from './config/env.js';
import { checkConnection } from './config/db.js';

try {
  await checkConnection();
  console.log('Conexión a MySQL verificada');
} catch (err) {
  console.error('No se pudo conectar a MySQL:', err.message);
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`Servidor en http://localhost:${config.port}${config.apiPrefix} [${config.env}]`);
});