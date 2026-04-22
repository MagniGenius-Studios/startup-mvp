import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';
import { isMissingProblemProgressStorageError } from '@utils/dbError';

import type { SubmitCodeInput } from '../validators/submission.validators';
import { evaluateCorrectness, generateExplainableFeedback } from './ai.service';
import { updateConceptMastery } from './concept.service';
import { upsertProblemProgress } from './progress.service';
import { updateStreak } from './streak.service';

// ─── Types ──────────────────────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Normalize text for output comparison:
 * trim, collapse whitespace, normalize line breaks.
 */
const normalizeOutput = (text: string): string =>
    text.trim().replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n');

/**
 * Naive print-statement extractor for MVP.
 * Extracts string literals from print()/console.log() calls.
 * NOT a real runtime — only handles simple cases with string literals.
 */
const naiveExtractPrints = (code: string, language: string): string | null => {
    const lines = code.split('\n');
    const outputs: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (language === 'python') {
            // Match: print("...") or print('...')
            const match = trimmed.match(/^print\s*\(\s*(?:f?)(["'])(.*?)\1\s*\)$/);
            if (match) {
                outputs.push(match[2]);
                continue;
            }
            // Match: print(variable) or print(expression) — skip, can't evaluate
            const simpleMatch = trimmed.match(/^print\s*\(\s*(.+?)\s*\)$/);
            if (simpleMatch) {
                // If it's a simple number or expression, include as-is
                const inner = simpleMatch[1];
                if (/^[\d+\-*/%\s().]+$/.test(inner)) {
                    try {
                        // Safe arithmetic-only eval
                        const result = Function(`"use strict"; return (${inner})`)();
                        outputs.push(String(result));
                    } catch {
                        // Can't evaluate — skip
                    }
                }
            }
        } else if (language === 'javascript' || language === 'typescript') {
            // Match: console.log("...") or console.log('...')
            const match = trimmed.match(/^console\.log\s*\(\s*(["'`])(.*?)\1\s*\)$/);
            if (match) {
                outputs.push(match[2]);
                continue;
            }
            const simpleMatch = trimmed.match(/^console\.log\s*\(\s*(.+?)\s*\)$/);
            if (simpleMatch) {
                const inner = simpleMatch[1];
                if (/^[\d+\-*/%\s().]+$/.test(inner)) {
                    try {
                        const result = Function(`"use strict"; return (${inner})`)();
                        outputs.push(String(result));
                    } catch {
                        // Can't evaluate
                    }
                }
            }
        }
    }

    return outputs.length > 0 ? outputs.join('\n') : null;
};

// ─── Main Service ───────────────────────────────────────────────

export const createAndAnalyzeSubmission = async (
    userId: string,
    input: SubmitCodeInput,
): Promise<SubmissionCreateResult> => {
    const prisma = getPrismaClient();

    // 1. Verify the problem exists and get its description + reference solution
    const problem = await prisma.problem.findUnique({
        where: { id: input.problemId },
        select: {
            id: true,
            title: true,
            description: true,
            solutionCode: true,
            solutionReference: true,
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

    // 2. Create submission with ANALYZING status
    const submission = await prisma.submission.create({
        data: {
            userId,
            problemId: input.problemId,
            code: input.code,
            language: input.language,
            status: 'ANALYZING',
        },
        select: {
            id: true,
        },
    });

    try {
        // 3. Evaluate correctness by comparing with the canonical solution
        const referenceSolution = problem.solutionCode || problem.solutionReference || '';
        const isCorrect = referenceSolution
            ? evaluateCorrectness(input.code, referenceSolution)
            : false;

        // 3b. Compute output comparison if expectedOutput is available
        let userOutput: string | null = null;
        const expectedOutput = problem.expectedOutput ?? null;

        if (expectedOutput) {
            userOutput = naiveExtractPrints(input.code, input.language);
        }

        console.info(`[Submission] Correctness: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);

        // 4. Generate structured AI feedback using canonical solution comparison
        const problemDescription = [problem.title, problem.description ?? ''].filter(Boolean).join('\n\n');
        const conceptNames = problem.concepts.map((c) => c.concept.name);
        const feedbackResult = await generateExplainableFeedback(
            problemDescription,
            referenceSolution,
            input.code,
            isCorrect,
            conceptNames,
        );

        // 5. Store the structured feedback in the database.
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

        // 6. Update submission with score and correctness flag
        const score = isCorrect ? 100 : 0;
        await prisma.submission.update({
            where: { id: submission.id },
            data: {
                status: 'COMPLETED',
                score,
                isCorrect,
            },
        });

        // 7. Update progress status for this problem
        await upsertProblemProgress(userId, input.problemId, isCorrect);

        // 8. Update concept mastery scores
        await updateConceptMastery(userId, input.problemId, isCorrect).catch((err) => {
            console.error('[Submission] Concept mastery update failed:', err);
        });

        // 9. Update daily streak
        await updateStreak(userId).catch((err) => {
            console.error('[Submission] Streak update failed:', err);
        });

        // 9. Return submission payload with output comparison
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
        // Mark submission as ERROR if anything goes wrong
        await prisma.submission
            .update({
                where: { id: submission.id },
                data: { status: 'ERROR' },
            })
            .catch(() => undefined);

        throw error;
    }
};

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
