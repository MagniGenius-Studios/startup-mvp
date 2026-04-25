import { Router } from 'express';

import { listLanguages } from '../controllers/problemController';
import { asyncHandler } from '../middleware/asyncHandler';

// Language routes: list supported learning languages for the UI.
const router = Router();

router.get('/', asyncHandler(listLanguages));

export default router;
