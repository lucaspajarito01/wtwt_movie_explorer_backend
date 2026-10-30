import 'dotenv/config';
import { readFileSync } from 'node:fs';
import semver from 'semver';

const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')
);

if (!semver.valid(pkg.version)) {
  throw new Error(`La versión "${pkg.version}" de package.json no es semver válido`);
}
if (pkg.engines?.node && !semver.satisfies(process.version, pkg.engines.node)) {
  throw new Error(`Se requiere Node ${pkg.engines.node}; versión actual: ${process.version}`);
}

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
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  },
};

if (!config.jwt.secret) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export default config;
