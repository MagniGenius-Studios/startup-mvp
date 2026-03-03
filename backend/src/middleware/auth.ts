import { NextFunction, Request, Response } from 'express';

import { getUserById } from '@services/auth.service';
import { AppError } from '@utils/AppError';
import { verifyToken } from '@utils/jwt';

import type { UserDto } from '@services/auth.service';

// Extend the Express Request type to carry the authenticated user
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: UserDto;
        }
    }
}

export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Try cookie first, then Authorization header
        let token: string | undefined;

        if (req.cookies?.token) {
            token = req.cookies.token as string;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('Authentication required', 401);
        }

        const payload = verifyToken(token);
        const user = await getUserById(payload.userId);
        req.user = user;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Invalid or expired token', 401));
        }
    }
};
