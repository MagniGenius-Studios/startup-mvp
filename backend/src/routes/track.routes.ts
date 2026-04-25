import { Router } from 'express';

import { listTracksByLanguage } from '../controllers/problemController';
import { asyncHandler } from '../middleware/asyncHandler';

// Track routes: list learning tracks for a selected language slug.
const router = Router();

router.get('/:languageSlug', asyncHandler(listTracksByLanguage));

export default router;
