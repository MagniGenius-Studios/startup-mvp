import jwt from 'jsonwebtoken';

import { env } from '@config/env';

export interface JwtPayload {
    userId: string;
}

export const signToken = (userId: string): string => {
    return jwt.sign({ userId } satisfies JwtPayload, env.jwtSecret, {
        expiresIn: '24h',
    });
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
