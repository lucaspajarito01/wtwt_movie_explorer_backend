import { Router } from 'express';
import config from '../../config/env.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API operativa',
    version: config.version,
    timestamp: new Date().toISOString(),
  });
});

export default router;