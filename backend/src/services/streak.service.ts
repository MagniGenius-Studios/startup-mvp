import { getPrismaClient } from '@config/db';
import { isMissingProblemProgressStorageError } from '@utils/dbError';

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Check if two dates fall on the same calendar day (UTC).
 */
const isSameDay = (a: Date, b: Date): boolean =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

/**
 * Check if `a` is exactly one calendar day before `b` (UTC).
 */
const isYesterday = (a: Date, b: Date): boolean => {
    const yesterday = new Date(b);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return isSameDay(a, yesterday);
};

// ─── Service ────────────────────────────────────────────────────

/**
 * Update the user's daily streak after a submission.
 *
 * Logic:
 * - If lastActive is yesterday → increment current
 * - If lastActive is today → no change
 * - Else (gap > 1 day or first ever) → reset to 1
 */
export const updateStreak = async (userId: string): Promise<void> => {
    const prisma = getPrismaClient();
    const now = new Date();

    try {
        const existing = await prisma.userStreak.findUnique({
            where: { userId },
        });

        if (!existing) {
            // First submission ever — start streak at 1
            await prisma.userStreak.create({
                data: {
                    userId,
                    current: 1,
                    lastActive: now,
                },
            });
            return;
        }

        if (isSameDay(existing.lastActive, now)) {
            // Already submitted today — no change
            return;
        }

        const newCurrent = isYesterday(existing.lastActive, now)
            ? existing.current + 1
            : 1;

        await prisma.userStreak.update({
            where: { userId },
            data: {
                current: newCurrent,
                lastActive: now,
            },
        });
    } catch (error) {
        if (isMissingProblemProgressStorageError(error)) {
            // Table doesn't exist yet — gracefully skip
            return;
        }
        throw error;
    }
};

/**
 * Get the user's current streak count (0 if no record).
 */
export const getStreak = async (userId: string): Promise<number> => {
    const prisma = getPrismaClient();

    try {
        const streak = await prisma.userStreak.findUnique({
            where: { userId },
            select: { current: true, lastActive: true },
        });

        if (!streak) {
            return 0;
        }

        // If the streak is stale (last active was more than 1 day ago), return 0
        const now = new Date();
        if (!isSameDay(streak.lastActive, now) && !isYesterday(streak.lastActive, now)) {
            return 0;
        }

        return streak.current;
    } catch (error) {
        if (isMissingProblemProgressStorageError(error)) {
            return 0;
        }
        throw error;
    }
};
