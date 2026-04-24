import { getDashboard } from '@controllers/dashboardController';
import { asyncHandler } from '@middleware/asyncHandler';
import { authGuard } from '@middleware/auth';
import { Router } from 'express';

// Dashboard routes: aggregate learner insights for home screen.
const router = Router();

router.use(authGuard);

router.get('/', asyncHandler(getDashboard));

export default router;
