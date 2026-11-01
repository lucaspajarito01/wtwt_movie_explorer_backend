import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ role: user.role }, config.jwt.secret, {
    subject: String(user.id),
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256',
  });
}