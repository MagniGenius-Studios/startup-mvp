import { Router } from 'express';

import { listLanguages } from '../controllers/problemController';

const router = Router();

router.get('/', listLanguages);

export default router;
