import * as submissionService from '@services/submission.service';
import { NextFunction, Request, Response } from 'express';

import {
    submissionProblemParamSchema,
    submitCodeSchema,
} from '../validators/submission.validators';

export const submitCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = submitCodeSchema.safeParse(req.body);
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

        const result = await submissionService.createAndAnalyzeSubmission(
            req.user.id,
            parsed.data,
        );

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const getLatestSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const parsed = submissionProblemParamSchema.safeParse(req.params);
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

        const submission = await submissionService.getLatestSubmissionForProblem(
            req.user.id,
            parsed.data.problemId,
        );

        res.status(200).json({ submission });
    } catch (error) {
        next(error);
    }
};

export const getSubmissionHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const parsed = submissionProblemParamSchema.safeParse(req.params);
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

        const history = await submissionService.getSubmissionHistory(
            req.user.id,
            parsed.data.problemId,
        );

        res.status(200).json({ history });
    } catch (error) {
        next(error);
    }
};
