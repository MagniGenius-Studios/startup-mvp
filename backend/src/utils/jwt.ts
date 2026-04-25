import { sign, verify } from 'jsonwebtoken';

import { env } from '../config/env';

// JWT helpers for stateless auth cookies and Bearer tokens.
export interface JwtPayload {
    userId: string;
}

export const signToken = (userId: string): string => {
  return sign({ userId } satisfies JwtPayload, env.jwtSecret, {
    expiresIn: '24h',
  });
};

// Decodes and verifies token signature/expiry.
export const verifyToken = (token: string): JwtPayload => {
    return verify(token, env.jwtSecret) as JwtPayload;
};
