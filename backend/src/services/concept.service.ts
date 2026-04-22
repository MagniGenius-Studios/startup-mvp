import { getPrismaClient } from '@config/db';

// ─── Types ──────────────────────────────────────────────────────

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

// ─── Constants ──────────────────────────────────────────────────

const CORRECT_DELTA = 10;
const INCORRECT_DELTA = 2;
const MAX_SCORE = 100;

// ─── Mastery Update ─────────────────────────────────────────────

/**
 * After a submission, update mastery for every concept linked to the problem.
 *
 * Logic:
 * - isCorrect → +10 (up to 100)
 * - !isCorrect → +2  (up to 100)
 *
 * Uses upsert on the (userId, conceptId) unique constraint.
 */
export const updateConceptMastery = async (
    userId: string,
    problemId: string,
    isCorrect: boolean,
): Promise<void> => {
    const prisma = getPrismaClient();

    // 1. Get all concept links for this problem (single query, no N+1)
    const links = await prisma.problemConcept.findMany({
        where: { problemId },
        select: { conceptId: true },
    });

    if (links.length === 0) {
        // Problem has no concept tags — skip silently
        return;
    }

    const delta = isCorrect ? CORRECT_DELTA : INCORRECT_DELTA;

    // 2. Upsert mastery for each concept (parallel batch)
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

// ─── Read Mastery ───────────────────────────────────────────────

/**
 * Get all concept mastery scores for a user, weakest first.
 */
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

// ─── Weak Concepts ──────────────────────────────────────────────

/**
 * Return the N lowest-scored concepts for a user.
 */
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

// ─── Recommendations ────────────────────────────────────────────

/**
 * Recommend problems the user should work on, based on their weakest concepts.
 *
 * Flow:
 * 1. Get weakest 3 concepts
 * 2. Find problems linked to those concepts
 * 3. Exclude already-COMPLETED problems
 * 4. Order by easiest first
 * 5. Limit 5
 */
export const getRecommendedProblems = async (
    userId: string,
): Promise<RecommendedProblemDto[]> => {
    const prisma = getPrismaClient();

    // 1. Get weak concepts
    const weakConcepts = await getWeakConcepts(userId, 3);

    if (weakConcepts.length === 0) {
        // User has no mastery data yet — return easiest unsolved problems
        return getEasiestUnsolvedProblems(userId);
    }

    const weakConceptIds = weakConcepts.map((wc) => wc.concept.id);

    // 2. Get completed problem IDs (to exclude)
    const completedRecords = await prisma.problemProgress.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { problemId: true },
    });
    const completedIds = new Set(completedRecords.map((r) => r.problemId));

    // 3. Find problems linked to weak concepts
    const problemLinks = await prisma.problemConcept.findMany({
        where: { conceptId: { in: weakConceptIds } },
        select: {
            problem: {
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
            },
        },
    });

    // 4. Deduplicate and exclude completed
    const seen = new Set<string>();
    const candidates: RecommendedProblemDto[] = [];

    for (const link of problemLinks) {
        const p = link.problem;
        if (completedIds.has(p.id) || seen.has(p.id)) continue;
        seen.add(p.id);

        candidates.push({
            problemId: p.id,
            title: p.title,
            difficulty: p.difficulty,
            concepts: p.concepts.map((c) => c.concept.name),
        });
    }

    // 5. Sort: EASY < MEDIUM < HARD, then take 5
    const difficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
    candidates.sort(
        (a, b) =>
            (difficultyOrder[a.difficulty?.toLowerCase() ?? ''] ?? 99) -
            (difficultyOrder[b.difficulty?.toLowerCase() ?? ''] ?? 99),
    );

    return candidates.slice(0, 5);
};

/**
 * Fallback: when user has no mastery data, return easiest unsolved problems.
 */
const getEasiestUnsolvedProblems = async (
    userId: string,
): Promise<RecommendedProblemDto[]> => {
    const prisma = getPrismaClient();

    const completedRecords = await prisma.problemProgress.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { problemId: true },
    });

    const completedIds = completedRecords.map((r) => r.problemId);

    const problems = await prisma.problem.findMany({
        where: completedIds.length > 0 ? { id: { notIn: completedIds } } : {},
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
        take: 5,
    });

    return problems.map((p) => ({
        problemId: p.id,
        title: p.title,
        difficulty: p.difficulty,
        concepts: p.concepts.map((c) => c.concept.name),
    }));
};
