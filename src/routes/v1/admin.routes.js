import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { ROLES } from "../../utils/roles.js";
import { matchedData } from 'express-validator';
import validate from '../../middlewares/validate.js';
import { idParam, paginationRules } from '../../validators/common.validators.js';

const router = Router();

// Todas las rutas de este archivo exigen admin
router.use(authenticate, authorize(ROLES.ADMIN));

// TEMPORAL: eliminar cuando ME-13 esté integrado
router.get("/ping", (req, res) => {
  res.json({ success: true, message: `Hola admin ${req.user.username}` });
});

// TEMPORAL: eliminar cuando ME-13 esté integrado
router.get('/echo/:id', idParam(), paginationRules, validate, (req, res) => {
  res.json({ success: true, data: matchedData(req) });
});

export default router;
