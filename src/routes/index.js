import { Router } from 'express';
import healthRoutes from './v1/health.routes.js';
import authRoutes from "./v1/auth.routes.js";

const router = Router();

router.use('/health', healthRoutes);
router.use("/auth", authRoutes);
// Aquí irmos  montando las diferentes rutas: /auth, /categories, /titles, /reviews...

export default router;