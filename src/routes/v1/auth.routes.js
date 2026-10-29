import { Router } from "express";
import { register, login } from "../../controllers/auth.controller.js";
import validate from "../../middlewares/validate.js";
import { registerRules, loginRules } from "../../validators/auth.validators.js";

import { authenticate } from "../../middlewares/auth.js";
import { me } from "../../controllers/auth.controller.js";

import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);

router.get("/me", authenticate, me);

export default router;
