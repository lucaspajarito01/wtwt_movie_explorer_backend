import config from '../config/env.js';

export default function apiVersion(req, res, next) {
  res.setHeader('X-API-Version', config.version);
  next();
}