import { healthCheck } from '@controllers/healthController';
import { asyncHandler } from '@middleware/asyncHandler';
import { Router } from 'express';

// Health route: API liveliness and optional DB connectivity check.
const router = Router();

router.get('/', asyncHandler(healthCheck));

export default router;
