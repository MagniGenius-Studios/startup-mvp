import { getHint } from '@controllers/hintController';
import { asyncHandler } from '@middleware/asyncHandler';
import { authGuard } from '@middleware/auth';
import { validateBody } from '@middleware/validate';
import { Router } from 'express';

import { hintSchema } from '../validators/hint.validators';

// Hint routes: AI mentor hint generation for current code.
const router = Router();

router.use(authGuard);

router.post('/', validateBody(hintSchema), asyncHandler(getHint));

export default router;
