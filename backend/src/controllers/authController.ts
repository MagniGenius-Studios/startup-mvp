import { Request, Response } from 'express';

import { env } from '../config/env';
import { requireUser } from '../middleware/auth';
import * as authService from '../services/auth.service';
import type { LoginInput, RegisterInput } from '../validators/auth.validators';

// Auth controller: registration, login, session lookup, and logout endpoints.
const isProduction = env.nodeEnv === 'production';

const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};

const COOKIE_OPTIONS = {
  ...COOKIE_BASE_OPTIONS,
  maxAge: env.authCookieMaxAgeMs,
};

// Handles POST /auth/register.
// Validates input -> creates user/token via service -> returns cookie + user payload.
export const register = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as RegisterInput;
  const { user, token } = await authService.registerUser(input);

  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({
    message: 'Registration successful',
    user,
    token,
  });
};

// Handles POST /auth/login.
// Validates credentials -> gets token from service -> returns cookie + user payload.
export const login = async (req: Request, res: Response): Promise<void> => {
  const input = req.body as LoginInput;
  const { user, token } = await authService.loginUser(input);

  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(200).json({
    message: 'Login successful',
    user,
    token,
  });
};

// Handles GET /auth/me by returning user attached by auth middleware.
export const getMe = (req: Request, res: Response): void => {
  const user = requireUser(req);
  res.status(200).json({ user });
};

// Handles POST /auth/logout by clearing auth cookie.
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', COOKIE_BASE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
};
