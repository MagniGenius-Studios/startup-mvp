import { requireUser } from '@middleware/auth';
import * as submissionService from '@services/submission.service';
import { Request, Response } from 'express';

import type {
  SubmissionProblemParamInput,
  SubmitCodeInput,
} from '../validators/submission.validators';

// Submission controller: submit code, latest attempt, and attempt history endpoints.
export const submitCode = async (req: Request, res: Response): Promise<void> => {
  // Authenticated user + request payload -> service evaluation -> API response.
  const user = requireUser(req);
  const input = req.body as SubmitCodeInput;

  const result = await submissionService.createAndAnalyzeSubmission(user.id, input);
  res.status(201).json(result);
};

// Handles GET /submissions/:problemId for the latest completed submission.
export const getLatestSubmission = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const { problemId } = req.params as SubmissionProblemParamInput;
  const submission = await submissionService.getLatestSubmissionForProblem(user.id, problemId);
  res.status(200).json({ submission });
};

// Handles GET /submissions/history/:problemId for recent attempt timeline.
export const getSubmissionHistory = async (req: Request, res: Response): Promise<void> => {
  const user = requireUser(req);
  const { problemId } = req.params as SubmissionProblemParamInput;
  const history = await submissionService.getSubmissionHistory(user.id, problemId);
  res.status(200).json({ history });
};
