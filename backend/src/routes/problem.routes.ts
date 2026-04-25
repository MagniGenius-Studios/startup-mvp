import { Router } from 'express';

import { getProblem, listProblemsByTrack } from '../controllers/problemController';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams } from '../middleware/validate';
import { problemDetailParamSchema, trackParamSchema } from '../validators/problem.validators';

// Problem routes: problem list by track + detailed problem payload.
const router = Router();

router.get('/detail/:id', validateParams(problemDetailParamSchema), asyncHandler(getProblem));
router.get('/:trackId', validateParams(trackParamSchema), asyncHandler(listProblemsByTrack));

export default router;
