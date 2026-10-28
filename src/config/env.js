import 'dotenv/config';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  corsOrigin: (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  apiPrefix: '/api/v1',
  version: pkg.version,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
};

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export default config;