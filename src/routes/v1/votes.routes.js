import { Router } from "express";
import { unvote, vote } from "../../controllers/vote.controller.js";
import { authenticate } from "../../middlewares/auth.js";
import validate from "../../middlewares/validate.js";
import { idParam } from "../../validators/common.validators.js";
import { voteRules } from "../../validators/vote.validators.js";

// mergeParams: permite leer :id de la ruta padre (/reviews/:id/vote)
const router = Router({ mergeParams: true });

router.put("/", authenticate, idParam(), voteRules, validate, vote);
router.delete("/", authenticate, idParam(), validate, unvote);

export default router;