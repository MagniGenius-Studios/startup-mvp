import { Router } from 'express';

import { getMe, login, logout, register } from '../controllers/authController';
import { asyncHandler } from '../middleware/asyncHandler';
import { authGuard } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/auth.validators';

// Authentication routes: registration, login, session lookup, and logout.
const router = Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));

router.post('/login', validateBody(loginSchema), asyncHandler(login));

router.get('/me', authGuard, getMe);

router.post('/logout', logout);

export default router;
