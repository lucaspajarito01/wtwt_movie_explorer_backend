import { Router } from 'express';
import healthRoutes from './v1/health.routes.js';
import authRoutes from "./v1/auth.routes.js";
import adminRoutes from "./v1/admin.routes.js";
import categoriesRoutes from "./v1/categories.routes.js";
import titlesRoutes from "./v1/titles.routes.js";
import reviewsRoutes from "./v1/reviews.routes.js";

const router = Router();

// Aquí irmos  montando las diferentes rutas: /auth, /categories, /titles, /reviews...
router.use('/health', healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoriesRoutes);
router.use("/titles", titlesRoutes);
router.use("/reviews", reviewsRoutes);

export default router;