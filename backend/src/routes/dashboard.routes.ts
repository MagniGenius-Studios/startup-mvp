import { getDashboard } from '@controllers/dashboardController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
  void authenticate(req, res, () => {
    void getDashboard(req, res, next);
  });
});

export default router;
