import { Router } from "express";
import { register, login } from "../../controllers/auth.controller.js";
import validate from "../../middlewares/validate.js";
import { registerRules, loginRules } from "../../validators/auth.validators.js";

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);

export default router;
