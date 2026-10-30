import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { ROLES } from "../../utils/roles.js";
import { matchedData } from 'express-validator';
import validate from '../../middlewares/validate.js';
import { idParam, paginationRules } from '../../validators/common.validators.js';

const router = Router();

// Todas las rutas de este archivo exigen admin
router.use(authenticate, authorize(ROLES.ADMIN));

export default router;
