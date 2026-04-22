import { listProblemProgress } from '@controllers/progressController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.get('/problems', (req, res, next) => {
  void authenticate(req, res, () => {
    void listProblemProgress(req, res, next);
  });
});

export default router;
