import { Router } from 'express';
import healthRoutes from './v1/health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
// Aquí irmos  montando las diferentes rutas: /auth, /categories, /titles, /reviews...

export default router;