-- AlterTable: Transition AiFeedback from hint-based to structured feedback
-- Step 1: Add new columns with defaults so existing rows are populated
ALTER TABLE "AiFeedback" ADD COLUMN "mistake" TEXT NOT NULL DEFAULT 'Unable to analyze code precisely';
ALTER TABLE "AiFeedback" ADD COLUMN "concept" TEXT NOT NULL DEFAULT 'General';

-- Step 2: Migrate existing hint data into mistake column
UPDATE "AiFeedback" SET "mistake" = "hint" WHERE "hint" IS NOT NULL AND "hint" != '';

-- Step 3: Fill NULL improvements with a default
UPDATE "AiFeedback" SET "improvement" = 'Try reviewing your logic step-by-step' WHERE "improvement" IS NULL;

-- Step 4: Make improvement required (non-nullable)
ALTER TABLE "AiFeedback" ALTER COLUMN "improvement" SET NOT NULL;
ALTER TABLE "AiFeedback" ALTER COLUMN "improvement" SET DEFAULT 'Try reviewing your logic step-by-step';

-- Step 5: Drop the old hint column
ALTER TABLE "AiFeedback" DROP COLUMN "hint";

-- Step 6: Remove defaults (Prisma manages these at app level)
ALTER TABLE "AiFeedback" ALTER COLUMN "mistake" DROP DEFAULT;
ALTER TABLE "AiFeedback" ALTER COLUMN "concept" DROP DEFAULT;
ALTER TABLE "AiFeedback" ALTER COLUMN "improvement" DROP DEFAULT;
