import { getHint } from '@controllers/hintController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.post('/', (req, res, next) => {
  void authenticate(req, res, () => {
    void getHint(req, res, next);
  });
});

export default router;
