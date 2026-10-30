import { Router } from "express";
import { create, get, list, remove, update } from "../../controllers/category.controller.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import { idParam } from "../../validators/common.validators.js";
import { createCategoryRules, replaceCategoryRules, updateCategoryRules } from "../../validators/category.validators.js";
import { ROLES } from "../../utils/roles.js";

const router = Router();



router.get("/", list);
router.get("/:id", idParam(), validate, get);

router.use(authenticate, authorize(ROLES.ADMIN));

router.post("/", createCategoryRules, validate, create);
router.put("/:id", idParam(), replaceCategoryRules, validate, update);
router.patch("/:id", idParam(), updateCategoryRules, validate, update);
router.delete("/:id", idParam(), validate, remove);

export default router;
