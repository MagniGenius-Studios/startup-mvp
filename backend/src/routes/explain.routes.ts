import { Router } from 'express';

import { explainCode } from '../controllers/explainController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authGuard } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { explainCodeSchema } from '../validators/explain.validators';

// Explain routes: step-by-step code explanation endpoint.
const router = Router();

router.use(authGuard);

router.post('/', validateBody(explainCodeSchema), asyncHandler(explainCode));

export default router;
