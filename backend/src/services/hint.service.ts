import { getPrismaClient } from '@config/db';
import { AppError } from '@utils/AppError';

import type { HintInput } from '../validators/hint.validators';
import { generateExplainableFeedback } from './ai.service';
import { evaluateSubmission } from './evaluation.service';

export interface HintResult {
  isCorrect: boolean;
  mistake: string;
  concept: string;
  improvement: string;
}

export const generateHintForSubmission = async (input: HintInput): Promise<HintResult> => {
  const prisma = getPrismaClient();

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

  let evaluation;
  try {
    evaluation = evaluateSubmission({
      code: input.code,
      language: input.language,
      solutionCode: problem.solutionCode,
      expectedOutput: problem.expectedOutput,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'LANGUAGE_NOT_SUPPORTED') {
      throw new AppError('Language not supported for this problem', 400);
    }

    throw error;
  }

  const problemDescription = [problem.title, problem.description ?? ''].filter(Boolean).join('\n\n');
  const conceptNames = problem.concepts.map((c) => c.concept.name);

  const feedback = await generateExplainableFeedback(
    problemDescription,
    evaluation.referenceSolution,
    input.code,
    evaluation.isCorrect,
    conceptNames,
    input.language,
  );

  return {
    isCorrect: evaluation.isCorrect,
    mistake: feedback.mistake,
    concept: feedback.concept,
    improvement: feedback.improvement,
  };
};
