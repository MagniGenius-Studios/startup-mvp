import { Router } from 'express';

import { listTracksByLanguage } from '../controllers/problemController';

const router = Router();

router.get('/:languageSlug', listTracksByLanguage);

export default router;
