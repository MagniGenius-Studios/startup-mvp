import * as hintService from '@services/hint.service';
import { Request, Response } from 'express';

import type { HintInput } from '../validators/hint.validators';

// Handles POST /hint -> analyzes current code and returns concise AI guidance.
export const getHint = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as HintInput;
  const hint = await hintService.generateHintForSubmission(input);
  res.status(200).json(hint);
};
