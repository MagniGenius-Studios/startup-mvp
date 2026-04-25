import { getPrismaClient } from '../config/db';
import { isMissingProblemProgressStorageError } from '../utils/dbError';

// Streak service: tracks consecutive active days based on submissions.
// Compare dates in UTC to keep behavior consistent across timezones.
const isSameDay = (a: Date, b: Date): boolean =>
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate();

// Checks whether `a` is exactly one day before `b`.
const isYesterday = (a: Date, b: Date): boolean => {
    const yesterday = new Date(b);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return isSameDay(a, yesterday);
};

// Updates streak after each submission.
// Yesterday increments, same-day keeps, longer gap resets to 1.
export const updateStreak = async (userId: string): Promise<void> => {
    const prisma = getPrismaClient();
    const now = new Date();

    try {
        const existing = await prisma.userStreak.findUnique({
            where: { userId },
        });

        if (!existing) {
            // First activity creates a streak baseline.
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
            // Avoid double-counting multiple submissions in one day.
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
            // Backward compatibility for DBs missing streak table.
            return;
        }
        throw error;
    }
};

// Returns current streak, or 0 when record is missing/stale.
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

        // Streak expires when user skipped more than one day.
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
