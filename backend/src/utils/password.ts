import { compare, hash } from 'bcrypt';

const SALT_ROUNDS = 12;

// Hashes plaintext passwords before storage.
export const hashPassword = async (plainPassword: string): Promise<string> => {
    return hash(plainPassword, SALT_ROUNDS);
};

// Compares login password with stored bcrypt hash.
export const comparePassword = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    return compare(plainPassword, hashedPassword);
};
