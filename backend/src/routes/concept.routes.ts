import { getUserConceptMastery, getRecommendedProblems } from '@services/concept.service';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

import type { Request, Response, NextFunction } from 'express';

const router = Router();

const getMastery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const mastery = await getUserConceptMastery(req.user.id);
        res.status(200).json({ mastery });
    } catch (error) {
        next(error);
    }
};

const getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recommendations = await getRecommendedProblems(req.user.id);
        res.status(200).json({ recommendations });
    } catch (error) {
        next(error);
    }
};

router.get('/mastery', (req, res, next) => {
    void authenticate(req, res, () => {
        void getMastery(req, res, next);
    });
});

router.get('/recommendations', (req, res, next) => {
    void authenticate(req, res, () => {
        void getRecommendations(req, res, next);
    });
});

export default router;
