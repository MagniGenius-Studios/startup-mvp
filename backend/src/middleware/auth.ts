import { NextFunction, Request, RequestHandler, Response } from 'express';

import type { UserDto } from '../services/auth.service';
import { getUserById } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

// Auth middleware: resolves user from JWT and protects private routes.
// Extend Express Request to carry the authenticated user object.
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
        // Read token from cookie first, then Bearer header fallback.
        let token: string | undefined;

        if (req.cookies?.token) {
            token = req.cookies.token as string;
        } else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('Unauthorized', 401);
        }

        const payload = verifyToken(token);
        // Load fresh user snapshot so downstream handlers get current role/name.
        const user = await getUserById(payload.userId);
        req.user = user;

        next();
    } catch {
        next(new AppError('Unauthorized', 401));
    }
};

// Adapter to use async authenticate in standard Express middleware chains.
export const authGuard: RequestHandler = (req, res, next) => {
    void authenticate(req, res, next);
};

// Utility used by controllers to enforce user presence.
export const requireUser = (req: Request): UserDto => {
    if (!req.user) {
        throw new AppError('Unauthorized', 401);
    }

    return req.user;
};
