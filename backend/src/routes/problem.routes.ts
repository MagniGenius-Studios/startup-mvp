import { Router } from 'express';

import { getProblem, listProblems } from '../controllers/problemController';

const router = Router();

router.get('/', listProblems);
router.get('/:id', getProblem);

export default router;
