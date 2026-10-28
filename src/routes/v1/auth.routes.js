import { Router } from "express";
import { register, login } from "../../controllers/auth.controller.js";
import validate from "../../middlewares/validate.js";
import { registerRules, loginRules } from "../../validators/auth.validators.js";

import { authenticate } from "../../middlewares/auth.js";
import { me } from "../../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

router.get("/me", authenticate, me);

export default router;
