import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';
import { signToken } from '@utils/jwt';
import { comparePassword, hashPassword } from '@utils/password';

import type { LoginInput, RegisterInput } from '../validators/auth.validators';

// Auth service: user creation, credential verification, and token issuance.
export interface UserDto {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
}

interface AuthResult {
    user: UserDto;
    token: string;
}

const toUserDto = (user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date;
}): UserDto => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
});

// Creates a new account and returns a signed session token.
export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const prisma = getPrismaClient();

  // Prevent duplicate accounts for the same email address.
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  // Store only the bcrypt hash, never the raw password.
  const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

  const token = signToken(user.id);

  return { user: toUserDto(user), token };
};

// Validates login credentials and returns a fresh token on success.
export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
        where: { email: input.email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            passwordHash: true,
            createdAt: true,
        },
    });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare plaintext password from request with stored password hash.
  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
    }

    const token = signToken(user.id);

  return { user: toUserDto(user), token };
};

// Loads public-safe user fields for authenticated requests.
export const getUserById = async (userId: string): Promise<UserDto> => {
    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return toUserDto(user);
};
