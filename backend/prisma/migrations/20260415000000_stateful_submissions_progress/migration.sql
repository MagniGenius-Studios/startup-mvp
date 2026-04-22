-- Add correctness flag for fast restore/dashboard reads
ALTER TABLE "Submission"
ADD COLUMN "isCorrect" BOOLEAN NOT NULL DEFAULT false;

-- Backfill correctness from historical submission data
UPDATE "Submission"
SET "isCorrect" = CASE
    WHEN "score" IS NOT NULL AND "score" >= 100 THEN true
    WHEN "status" = 'COMPLETED' AND COALESCE("score", 0) > 0 THEN true
    ELSE false
END;

-- Add progress table for per-user per-problem state
CREATE TABLE "ProblemProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemProgress_pkey" PRIMARY KEY ("id")
);

-- Backfill progress from existing submissions
INSERT INTO "ProblemProgress" ("id", "userId", "problemId", "status", "updatedAt")
SELECT
    md5(random()::text || clock_timestamp()::text || s."userId" || s."problemId"),
    s."userId",
    s."problemId",
    CASE
        WHEN bool_or(s."isCorrect") THEN 'COMPLETED'
        ELSE 'IN_PROGRESS'
    END,
    CURRENT_TIMESTAMP
FROM "Submission" s
GROUP BY s."userId", s."problemId";

-- New indexes for latest submission and dashboard/progress queries
CREATE INDEX "Submission_userId_problemId_createdAt_idx"
ON "Submission"("userId", "problemId", "createdAt");

CREATE UNIQUE INDEX "ProblemProgress_userId_problemId_key"
ON "ProblemProgress"("userId", "problemId");

CREATE INDEX "ProblemProgress_userId_status_idx"
ON "ProblemProgress"("userId", "status");

-- Foreign key constraints
ALTER TABLE "ProblemProgress"
ADD CONSTRAINT "ProblemProgress_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProblemProgress"
ADD CONSTRAINT "ProblemProgress_problemId_fkey"
FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
