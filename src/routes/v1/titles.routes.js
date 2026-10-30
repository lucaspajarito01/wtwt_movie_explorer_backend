import { Router } from "express";
import { create, get, list, update } from "../../controllers/title.controller.js";
import { authenticate, optionalAuthenticate } from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import { idParam } from "../../validators/common.validators.js";
import {
  createTitleRules,
  listTitleRules,
  updateTitleRules,
} from "../../validators/title.validators.js";

const router = Router();

// Públicas (con token opcional para ver pendientes propios / filtro de admin)
router.get("/", optionalAuthenticate, listTitleRules, validate, list);
router.get("/:id", optionalAuthenticate, idParam(), validate, get);

// Requieren sesión
router.post("/", authenticate, createTitleRules, validate, create);
router.patch("/:id", authenticate, idParam(), updateTitleRules, validate, update);

export default router;