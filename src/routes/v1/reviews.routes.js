import { Router } from "express";
import { create, remove, update, } from "../../controllers/review.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import { idParam } from "../../validators/common.validators.js";
import { createReviewRules, replaceReviewRules, updateReviewRules, } from "../../validators/review.validators.js";

const router = Router();

router.use(authenticate);

router.post("/", createReviewRules, validate, create);
router.put("/:id", idParam(), replaceReviewRules, validate, update);
router.patch("/:id", idParam(), updateReviewRules, validate, update);
router.delete("/:id", idParam(), validate, remove);

export default router;
