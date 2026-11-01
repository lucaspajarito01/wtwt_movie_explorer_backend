import { Router } from "express";
import validate from "../../middlewares/validate.js";
import { idParam } from "../../validators/common.validators.js";
import { createTitleRules, listTitleRules, updateTitleRules, } from "../../validators/title.validators.js";
import { approve, create, get, list, remove, update } from "../../controllers/title.controller.js";
import { authenticate, authorize, optionalAuthenticate } from "../../middlewares/auth.js";
import { ROLES } from "../../utils/roles.js";

const router = Router();

// Públicas (con token opcional para ver pendientes propios / filtro de admin)
router.get("/", optionalAuthenticate, listTitleRules, validate, list);
router.get("/:id", optionalAuthenticate, idParam(), validate, get);

// Requieren sesión
router.post("/", authenticate, createTitleRules, validate, create);
router.patch("/:id", authenticate, idParam(), updateTitleRules, validate, update);

// Solo administrador
router.patch("/:id/approve", authenticate, authorize(ROLES.ADMIN), idParam(), validate, approve);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN), idParam(), validate, remove);

export default router;