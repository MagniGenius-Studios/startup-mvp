import { getPrismaClient } from '../config/db';
import { normalizeLanguage } from '../constants/languages';
import { AppError } from '../utils/AppError';
import { isMissingProblemProgressStorageError } from '../utils/dbError';
import type { SubmitCodeInput } from '../validators/submission.validators';
import { generateExplainableFeedback } from './ai.service';
import { updateConceptMastery } from './concept.service';
import { evaluateSubmission } from './evaluation.service';
import { upsertProblemProgress } from './progress.service';
import { updateStreak } from './streak.service';

// Submission service: evaluates code, stores attempt state, and returns mentor feedback.
export interface LatestSubmissionDto {
    code: string;
    language: string;
    isCorrect: boolean;
    mistake: string | null;
    concept: string | null;
    improvement: string | null;
}

interface SubmissionCreateResult {
    submissionId: string;
    isCorrect: boolean;
    mistake: string;
    concept: string;
    improvement: string;
    userOutput: string | null;
    expectedOutput: string | null;
}

export interface SubmissionHistoryDto {
    id: string;
    code: string;
    isCorrect: boolean;
    createdAt: Date;
}

export const createAndAnalyzeSubmission = async (
    userId: string,
    input: SubmitCodeInput,
): Promise<SubmissionCreateResult> => {
    const prisma = getPrismaClient();
    const normalizedLanguage = normalizeLanguage(input.language);

    if (!normalizedLanguage) {
        throw new AppError('Language not supported', 400);
    }

    // Load problem metadata + reference solution before evaluating code.
    const problem = await prisma.problem.findUnique({
        where: { id: input.problemId },
        select: {
            id: true,
            title: true,
            description: true,
            solutionCode: true,
            expectedOutput: true,
            concepts: {
                select: {
                    concept: {
                        select: { name: true },
                    },
                },
            },
        },
    });

    if (!problem) {
        throw new AppError('Problem not found', 404);
    }

    // Persist early so each attempt has a row even if downstream steps fail.
    const submission = await prisma.submission.create({
        data: {
            userId,
            problemId: input.problemId,
            code: input.code,
            language: normalizedLanguage,
            status: 'ANALYZING',
        },
        select: {
            id: true,
        },
    });

    try {
        // Deterministic grading runs before AI feedback generation.
        let evaluationResult;
        try {
            evaluationResult = evaluateSubmission({
                code: input.code,
                language: normalizedLanguage,
                solutionCode: problem.solutionCode,
                expectedOutput: problem.expectedOutput,
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'LANGUAGE_NOT_SUPPORTED') {
                throw new AppError('Language not supported for this problem', 400);
            }

            throw error;
        }

        const { isCorrect, userOutput, expectedOutput, referenceSolution } = evaluationResult;

        console.info(`[Submission] Correctness: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

        // Build mentor response from user code vs canonical solution.
        const problemDescription = [problem.title, problem.description ?? ''].filter(Boolean).join('\n\n');
        const conceptNames = problem.concepts.map((c) => c.concept.name);
        const feedbackResult = await generateExplainableFeedback(
            problemDescription,
            referenceSolution,
            input.code,
            isCorrect,
            conceptNames,
            normalizedLanguage,
        );

        // Feedback persistence is optional for backward-compatible schemas.
        try {
            await prisma.aiFeedback.create({
                data: {
                    submissionId: submission.id,
                    mistake: feedbackResult.mistake,
                    concept: feedbackResult.concept,
                    improvement: feedbackResult.improvement,
                },
            });
        } catch (error) {
            if (!isMissingProblemProgressStorageError(error)) {
                throw error;
            }
        }

        // Mark submission as completed once evaluation + feedback succeed.
        const score = isCorrect ? 100 : 0;
        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: 'COMPLETED',
                score,
                isCorrect,
            },
        });

        // Sync problem progress so learn/dashboard pages update instantly.
        await upsertProblemProgress(userId, input.problemId, isCorrect);

        // Best-effort analytics updates should not fail the submission request.
        await updateConceptMastery(userId, input.problemId, isCorrect).catch((err) => {
            console.error('[Submission] Concept mastery update failed:', err);
        });

        // Streak updates are also best-effort.
        await updateStreak(userId).catch((err) => {
            console.error('[Submission] Streak update failed:', err);
        });

        // Return data needed by mentor panel + output comparison UI.
        return {
            submissionId: submission.id,
            isCorrect,
            mistake: feedbackResult.mistake,
            concept: feedbackResult.concept,
            improvement: feedbackResult.improvement,
            userOutput,
            expectedOutput,
        };
    } catch (error) {
        // Keep failed attempts out of ANALYZING state.
        await prisma.submission
            .update({
                where: { id: submission.id },
                data: { status: 'ERROR' },
            })
            .catch(() => undefined);

        throw error;
    }
};

// Returns last completed submission for workspace prefill.
export const getLatestSubmissionForProblem = async (
    userId: string,
    problemId: string,
): Promise<LatestSubmissionDto | null> => {
    const prisma = getPrismaClient();

    const submission = await prisma.submission.findFirst({
        where: {
            userId,
            problemId,
            status: 'COMPLETED',
        },
        select: {
            code: true,
            language: true,
            isCorrect: true,
            feedback: {
                select: {
                    mistake: true,
                    concept: true,
                    improvement: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!submission) {
        return null;
    }

    return {
        code: submission.code,
        language: submission.language,
        isCorrect: submission.isCorrect,
        mistake: submission.feedback[0]?.mistake ?? null,
        concept: submission.feedback[0]?.concept ?? null,
        improvement: submission.feedback[0]?.improvement ?? null,
    };
};

// Returns recent completed attempts for the history timeline.
export const getSubmissionHistory = async (
    userId: string,
    problemId: string,
): Promise<SubmissionHistoryDto[]> => {
    const prisma = getPrismaClient();

    return prisma.submission.findMany({
        where: {
            userId,
            problemId,
            status: 'COMPLETED',
        },
        select: {
            id: true,
            code: true,
            isCorrect: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
};
