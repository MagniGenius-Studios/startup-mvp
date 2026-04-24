import { listProblemProgress } from '@controllers/progressController';
import { asyncHandler } from '@middleware/asyncHandler';
import { authGuard } from '@middleware/auth';
import { validateQuery } from '@middleware/validate';
import { Router } from 'express';

import { problemProgressQuerySchema } from '../validators/progress.validators';

// Progress routes: per-problem status map for current user.
const router = Router();

router.use(authGuard);

router.get('/problems', validateQuery(problemProgressQuerySchema), asyncHandler(listProblemProgress));

export default router;
