import * as explainService from '@services/explain.service';
import { NextFunction, Request, Response } from 'express';

import { explainCodeSchema } from '../validators/explain.validators';

export const explainCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = explainCodeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: parsed.error.flatten().fieldErrors,
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const explanation = await explainService.explainCodeForProblem(parsed.data);

        res.status(200).json(explanation);
    } catch (error) {
        next(error);
    }
};
