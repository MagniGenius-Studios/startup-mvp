import { login } from '@controllers/authController';
import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  void login(req, res);
});

export default router;
