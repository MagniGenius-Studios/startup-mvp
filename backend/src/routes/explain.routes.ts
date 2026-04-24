import { explainCode } from '@controllers/explainController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.post('/', (req, res, next) => {
    void authenticate(req, res, () => {
        void explainCode(req, res, next);
    });
});

export default router;
