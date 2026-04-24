import { getMastery, getRecommendations } from '@controllers/conceptController';
import { asyncHandler } from '@middleware/asyncHandler';
import { authGuard } from '@middleware/auth';
import { Router } from 'express';

// Concept routes: mastery scores and recommendation feed.
const router = Router();

router.use(authGuard);

router.get('/mastery', asyncHandler(getMastery));
router.get('/recommendations', asyncHandler(getRecommendations));

export default router;
