import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';

import type { ExplainCodeInput } from '../validators/explain.validators';
import {
    type CodeExplanation,
    EXPLAIN_CODE_FALLBACK,
    explainCodeWithAI,
} from './ai.service';

export const explainCodeForProblem = async (
    input: ExplainCodeInput,
): Promise<CodeExplanation> => {
    const prisma = getPrismaClient();

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
        return EXPLAIN_CODE_FALLBACK;
    }

    return explainCodeWithAI({
        problemTitle: problem.title,
        problemDescription: problem.description ?? '',
        userCode: input.code,
        language: input.language,
    });
};
