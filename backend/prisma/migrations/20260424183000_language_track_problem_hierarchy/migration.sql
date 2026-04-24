-- Restructure learning hierarchy to Language -> Track -> Problem.

-- Create or normalize language lookup table.
CREATE TABLE IF NOT EXISTS "Language" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Language" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Language" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Language" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Language'
      AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "Language" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

UPDATE "Language"
SET "slug" = CASE
  WHEN LOWER("name") = 'python' THEN 'python'
  WHEN LOWER("name") IN ('c++', 'cpp') THEN 'cpp'
  WHEN LOWER("name") = 'java' THEN 'java'
  WHEN LOWER("name") IN ('javascript', 'js') THEN 'javascript'
  WHEN LOWER("name") IN ('go', 'golang') THEN 'go'
  ELSE regexp_replace(LOWER("name"), '[^a-z0-9]+', '', 'g')
END
WHERE "slug" IS NULL OR "slug" = '';

ALTER TABLE "Language" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Language_slug_key" ON "Language"("slug");

-- Add new hierarchy columns.
ALTER TABLE "Track" ADD COLUMN IF NOT EXISTS "languageId" TEXT;
ALTER TABLE "Problem" ADD COLUMN IF NOT EXISTS "trackId" TEXT;

-- Seed the supported learning languages.
INSERT INTO "Language" ("id", "slug", "name", "createdAt") VALUES
  ('f1000000-0000-0000-0000-000000000001', 'python', 'Python', CURRENT_TIMESTAMP),
  ('f1000000-0000-0000-0000-000000000002', 'cpp', 'C++', CURRENT_TIMESTAMP),
  ('f1000000-0000-0000-0000-000000000003', 'java', 'Java', CURRENT_TIMESTAMP),
  ('f1000000-0000-0000-0000-000000000004', 'javascript', 'JavaScript', CURRENT_TIMESTAMP),
  ('f1000000-0000-0000-0000-000000000005', 'go', 'Go', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Backfill tracks to Python by default for existing data.
UPDATE "Track"
SET "languageId" = (
  SELECT "id" FROM "Language" WHERE "slug" = 'python' LIMIT 1
)
WHERE "languageId" IS NULL;

-- Backfill problem.trackId from existing lesson/module hierarchy.
UPDATE "Problem" p
SET "trackId" = m."trackId"
FROM "Lesson" l
INNER JOIN "Module" m ON m."id" = l."moduleId"
WHERE p."lessonId" = l."id"
  AND p."trackId" IS NULL;

-- Create a fallback track when needed for orphaned problems.
WITH org AS (
  SELECT "id" FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1
), py AS (
  SELECT "id" FROM "Language" WHERE "slug" = 'python' LIMIT 1
)
INSERT INTO "Track" (
  "id",
  "organizationId",
  "languageId",
  "title",
  "description",
  "isPublished",
  "createdAt",
  "updatedAt"
)
SELECT
  'b0000000-0000-0000-0000-000000000100',
  org."id",
  py."id",
  'General Python Path',
  'Auto-created fallback track during hierarchy migration.',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM org, py
ON CONFLICT ("id") DO NOTHING;

-- Attach any remaining orphaned problems to a fallback track.
UPDATE "Problem"
SET "trackId" = COALESCE(
  (SELECT "id" FROM "Track" WHERE "id" = 'b0000000-0000-0000-0000-000000000100' LIMIT 1),
  (SELECT "id" FROM "Track" ORDER BY "createdAt" ASC LIMIT 1)
)
WHERE "trackId" IS NULL;

-- Align nullability with the new Problem model.
UPDATE "Problem"
SET "description" = COALESCE("description", '')
WHERE "description" IS NULL;

UPDATE "Problem"
SET "difficulty" = COALESCE(NULLIF("difficulty", ''), 'Easy')
WHERE "difficulty" IS NULL
   OR "difficulty" = '';

ALTER TABLE "Track" ALTER COLUMN "languageId" SET NOT NULL;
ALTER TABLE "Problem" ALTER COLUMN "trackId" SET NOT NULL;
ALTER TABLE "Problem" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Problem" ALTER COLUMN "difficulty" SET NOT NULL;

-- Add indexes for hierarchy navigation.
CREATE INDEX IF NOT EXISTS "Track_languageId_idx" ON "Track"("languageId");
CREATE INDEX IF NOT EXISTS "Problem_trackId_idx" ON "Problem"("trackId");
CREATE INDEX IF NOT EXISTS "Problem_trackId_position_idx" ON "Problem"("trackId", "position");

-- Add foreign keys.
ALTER TABLE "Track" DROP CONSTRAINT IF EXISTS "Track_languageId_fkey";
ALTER TABLE "Track"
ADD CONSTRAINT "Track_languageId_fkey"
FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_trackId_fkey";
ALTER TABLE "Problem"
ADD CONSTRAINT "Problem_trackId_fkey"
FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop deprecated language/category ownership from Problem (if still present).
ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_languageId_fkey";
ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_categoryId_fkey";
DROP INDEX IF EXISTS "Problem_languageId_idx";
DROP INDEX IF EXISTS "Problem_categoryId_idx";
DROP INDEX IF EXISTS "Problem_categoryId_position_idx";
ALTER TABLE "Problem" DROP COLUMN IF EXISTS "languageId";
ALTER TABLE "Problem" DROP COLUMN IF EXISTS "categoryId";
ALTER TABLE "Problem" DROP COLUMN IF EXISTS "solutionReference";

-- Drop deprecated lesson ownership from Problem (legacy structure).
ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_lessonId_fkey";
DROP INDEX IF EXISTS "Problem_lessonId_idx";
DROP INDEX IF EXISTS "Problem_lessonId_position_idx";
ALTER TABLE "Problem" DROP COLUMN IF EXISTS "lessonId";
