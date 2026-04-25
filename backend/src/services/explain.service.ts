import { getPrismaClient } from '../config/db';
import { AppError } from '../utils/AppError';
import type { ExplainCodeInput } from '../validators/explain.validators';
import {
    type CodeExplanation,
    EXPLAIN_CODE_FALLBACK,
    explainCodeWithAI,
} from './ai.service';

// Explain service: turns user code into step-by-step learning feedback.
export const explainCodeForProblem = async (
    input: ExplainCodeInput,
): Promise<CodeExplanation> => {
    const prisma = getPrismaClient();

    // Load problem context so AI explanations stay grounded in the task.
    const problem = await prisma.problem.findUnique({
        where: { id: input.problemId },
        select: {
            title: true,
            description: true,
        },
    });

    if (!problem) {
        throw new AppError('Problem not found', 404);
    }

    if (!input.code.trim()) {
        // Avoid expensive AI call when there is nothing to explain.
        return EXPLAIN_CODE_FALLBACK;
    }

    // Delegate to AI adapter with normalized problem metadata.
    return explainCodeWithAI({
        problemTitle: problem.title,
        problemDescription: problem.description ?? '',
        userCode: input.code,
        language: input.language,
    });
};
