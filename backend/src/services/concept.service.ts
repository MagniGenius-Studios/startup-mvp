import { getPrismaClient } from '../config/db';

// Concept service: mastery scoring and personalized problem recommendations.
export interface ConceptMasteryDto {
    concept: { id: string; slug: string; name: string };
    score: number;
}

export interface RecommendedProblemDto {
    problemId: string;
    title: string;
    difficulty: string | null;
    concepts: string[];
}

const CORRECT_DELTA = 10;
const INCORRECT_DELTA = 2;
const MAX_SCORE = 100;
const COMPLETED_STATUS = 'COMPLETED';

const difficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };

const sortByDifficulty = (a: { difficulty: string | null }, b: { difficulty: string | null }): number => {
    return (difficultyOrder[a.difficulty?.toLowerCase() ?? ''] ?? 99)
        - (difficultyOrder[b.difficulty?.toLowerCase() ?? ''] ?? 99);
};

// Updates concept mastery linked to a solved/attempted problem.
// Correct answers boost more, but both paths encourage practice.
export const updateConceptMastery = async (
    userId: string,
    problemId: string,
    isCorrect: boolean,
): Promise<void> => {
    const prisma = getPrismaClient();

    // Fetch concept links once to avoid per-concept lookup queries.
    const links = await prisma.problemConcept.findMany({
        where: { problemId },
        select: { conceptId: true },
    });

    if (links.length === 0) {
        // Some problems may not be tagged yet.
        return;
    }

    const delta = isCorrect ? CORRECT_DELTA : INCORRECT_DELTA;

    // Upsert preserves existing score and clamps at MAX_SCORE.
    await Promise.all(
        links.map(({ conceptId }) =>
            prisma.$executeRaw`
                INSERT INTO "ConceptMastery" ("id", "userId", "conceptId", "proficiency", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), ${userId}, ${conceptId}, ${delta}, NOW(), NOW())
                ON CONFLICT ("userId", "conceptId")
                DO UPDATE SET
                    "proficiency" = LEAST("ConceptMastery"."proficiency" + ${delta}, ${MAX_SCORE}),
                    "updatedAt" = NOW()
            `,
        ),
    );
};

// Lists all concept scores for a user from weakest to strongest.
export const getUserConceptMastery = async (
    userId: string,
): Promise<ConceptMasteryDto[]> => {
    const prisma = getPrismaClient();

    const records = await prisma.conceptMastery.findMany({
        where: { userId },
        select: {
            proficiency: true,
            concept: {
                select: { id: true, slug: true, name: true },
            },
        },
        orderBy: { proficiency: 'asc' },
    });

    return records.map((r) => ({
        concept: r.concept,
        score: r.proficiency,
    }));
};

// Returns the weakest N concepts used by dashboard and recommendation logic.
export const getWeakConcepts = async (
    userId: string,
    limit = 3,
): Promise<ConceptMasteryDto[]> => {
    const prisma = getPrismaClient();

    const records = await prisma.conceptMastery.findMany({
        where: { userId },
        select: {
            proficiency: true,
            concept: {
                select: { id: true, slug: true, name: true },
            },
        },
        orderBy: { proficiency: 'asc' },
        take: limit,
    });

    return records.map((r) => ({
        concept: r.concept,
        score: r.proficiency,
    }));
};

// Recommends next problems by combining weak concepts + unsolved filters.
export const getRecommendedProblems = async (
    userId: string,
): Promise<RecommendedProblemDto[]> => {
    const prisma = getPrismaClient();

    // Start from weak concepts so suggestions target skill gaps.
    const weakConcepts = await getWeakConcepts(userId, 3);

    if (weakConcepts.length === 0) {
        // Cold-start fallback for new users without mastery history.
        return getEasiestUnsolvedProblems(userId);
    }

    const weakConceptIds = weakConcepts.map((wc) => wc.concept.id);

    // Fetch candidate problems linked to weak concepts and not yet completed.
    const problems = await prisma.problem.findMany({
        where: {
            concepts: {
                some: {
                    conceptId: { in: weakConceptIds },
                },
            },
            progressRecords: {
                none: {
                    userId,
                    status: COMPLETED_STATUS,
                },
            },
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
            concepts: {
                select: {
                    concept: { select: { name: true } },
                },
            },
        },
        orderBy: { position: 'asc' },
        take: 30,
    });

    return problems
        .map((problem) => ({
            problemId: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            concepts: problem.concepts.map((c) => c.concept.name),
        }))
        .sort(sortByDifficulty)
        .slice(0, 5);
};

// Fallback recommendations for users with no concept mastery yet.
const getEasiestUnsolvedProblems = async (
    userId: string,
): Promise<RecommendedProblemDto[]> => {
    const prisma = getPrismaClient();

    const problems = await prisma.problem.findMany({
        where: {
            progressRecords: {
                none: {
                    userId,
                    status: COMPLETED_STATUS,
                },
            },
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
            concepts: {
                select: {
                    concept: { select: { name: true } },
                },
            },
        },
        orderBy: { position: 'asc' },
        take: 20,
    });

    return problems
        .map((problem) => ({
            problemId: problem.id,
            title: problem.title,
            difficulty: problem.difficulty,
            concepts: problem.concepts.map((c) => c.concept.name),
        }))
        .sort(sortByDifficulty)
        .slice(0, 5);
};
