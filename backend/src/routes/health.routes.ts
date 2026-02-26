import { healthCheck } from '@controllers/healthController';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
  void healthCheck(req, res, next);
});

export default router;
