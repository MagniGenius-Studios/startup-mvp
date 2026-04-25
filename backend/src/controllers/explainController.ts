import { Request, Response } from 'express';

import * as explainService from '../services/explain.service';
import type { ExplainCodeInput } from '../validators/explain.validators';

// Handles POST /explain -> returns step-by-step code explanation for current problem.
export const explainCode = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as ExplainCodeInput;
  const explanation = await explainService.explainCodeForProblem(input);
  res.status(200).json(explanation);
};
