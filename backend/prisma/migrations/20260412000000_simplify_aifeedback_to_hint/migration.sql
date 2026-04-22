-- Simplify AiFeedback: replace tier/summary/recommendations with a single hint field

-- Step 1: Add the hint column with a default derived from existing summary data
ALTER TABLE "AiFeedback" ADD COLUMN "hint" TEXT NOT NULL DEFAULT '';

-- Step 2: Populate hint from existing summary for old rows
UPDATE "AiFeedback" SET "hint" = "summary" WHERE "hint" = '';

-- Step 3: Drop the old columns
ALTER TABLE "AiFeedback" DROP COLUMN "tier";
ALTER TABLE "AiFeedback" DROP COLUMN "summary";
ALTER TABLE "AiFeedback" DROP COLUMN "recommendations";

-- Step 4: Drop the old tier index
DROP INDEX IF EXISTS "AiFeedback_tier_idx";

-- Step 5: Drop the FeedbackTier enum (no longer used)
DROP TYPE IF EXISTS "FeedbackTier";

-- Step 6: Remove the default on hint (not needed for new rows)
ALTER TABLE "AiFeedback" ALTER COLUMN "hint" DROP DEFAULT;
