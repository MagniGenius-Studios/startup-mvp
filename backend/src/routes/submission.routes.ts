import { Router } from 'express';

import { getLatestSubmission, getSubmissionHistory, submitCode } from '../controllers/submissionController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authGuard } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { submissionProblemParamSchema, submitCodeSchema } from '../validators/submission.validators';

// Submission routes: create attempt, latest attempt, and attempt history.
const router = Router();

// All submission endpoints require a signed-in user.
router.use(authGuard);

router.post('/', validateBody(submitCodeSchema), asyncHandler(submitCode));
router.get('/history/:problemId', validateParams(submissionProblemParamSchema), asyncHandler(getSubmissionHistory));
router.get('/:problemId', validateParams(submissionProblemParamSchema), asyncHandler(getLatestSubmission));

export default router;
