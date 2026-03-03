import { getMe, login, logout, register } from '@controllers/authController';
import { authenticate } from '@middleware/auth';
import { Router } from 'express';

const router = Router();

router.post('/register', (req, res, next) => {
  void register(req, res, next);
});

router.post('/login', (req, res, next) => {
  void login(req, res, next);
});

router.get('/me', (req, res, next) => {
  void authenticate(req, res, () => {
    void getMe(req, res, next);
  });
});

router.post('/logout', (req, res) => {
  logout(req, res);
});

export default router;
