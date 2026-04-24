import { Router } from 'express';

import { getProblem, listProblemsByTrack } from '../controllers/problemController';

const router = Router();

router.get('/detail/:id', getProblem);
router.get('/:trackId', listProblemsByTrack);

export default router;
