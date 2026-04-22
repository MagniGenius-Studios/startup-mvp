import { getLatestSubmission, getSubmissionHistory, submitCode } from '@controllers/submissionController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.post('/', (req, res, next) => {
    void authenticate(req, res, () => {
        void submitCode(req, res, next);
    });
});

router.get('/history/:problemId', (req, res, next) => {
    void authenticate(req, res, () => {
        void getSubmissionHistory(req, res, next);
    });
});

router.get('/:problemId', (req, res, next) => {
    void authenticate(req, res, () => {
        void getLatestSubmission(req, res, next);
    });
});

export default router;
