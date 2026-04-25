import { Router } from 'express';

import { healthCheck } from '../controllers/healthController';
import { asyncHandler } from '../middleware/asyncHandler';

// Health route: API liveliness and optional DB connectivity check.
const router = Router();

router.get('/', asyncHandler(healthCheck));

export default router;
