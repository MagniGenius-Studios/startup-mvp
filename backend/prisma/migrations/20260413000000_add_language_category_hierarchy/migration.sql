-- Add language/category hierarchy for problem browsing.

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE INDEX "Category_languageId_idx" ON "Category"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_languageId_name_key" ON "Category"("languageId", "name");

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN "languageId" TEXT;
ALTER TABLE "Problem" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Problem" ADD COLUMN "solutionCode" TEXT;

-- Seed default hierarchy rows for backfilling existing problems.
INSERT INTO "Language" ("id", "name", "createdAt", "updatedAt")
VALUES ('f0000000-0000-0000-0000-000000000001', 'Python', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

WITH python AS (
  SELECT "id" FROM "Language" WHERE "name" = 'Python' LIMIT 1
)
INSERT INTO "Category" ("id", "name", "languageId", "createdAt", "updatedAt")
SELECT 'f0000000-0000-0000-0000-000000000101', 'Basics', python."id", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM python
ON CONFLICT ("languageId", "name") DO NOTHING;

-- Backfill existing problem rows.
UPDATE "Problem"
SET "languageId" = (
  SELECT "id" FROM "Language" WHERE "name" = 'Python' LIMIT 1
)
WHERE "languageId" IS NULL;

UPDATE "Problem"
SET "categoryId" = (
  SELECT c."id"
  FROM "Category" c
  INNER JOIN "Language" l ON l."id" = c."languageId"
  WHERE l."name" = 'Python' AND c."name" = 'Basics'
  LIMIT 1
)
WHERE "categoryId" IS NULL;

UPDATE "Problem"
SET "solutionCode" = COALESCE("solutionReference", '')
WHERE "solutionCode" IS NULL;

-- Enforce required fields after backfill.
ALTER TABLE "Problem" ALTER COLUMN "languageId" SET NOT NULL;
ALTER TABLE "Problem" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Problem" ALTER COLUMN "solutionCode" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Problem_languageId_idx" ON "Problem"("languageId");

-- CreateIndex
CREATE INDEX "Problem_categoryId_idx" ON "Problem"("categoryId");

-- CreateIndex
CREATE INDEX "Problem_categoryId_position_idx" ON "Problem"("categoryId", "position");

-- AddForeignKey
ALTER TABLE "Category"
ADD CONSTRAINT "Category_languageId_fkey"
FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem"
ADD CONSTRAINT "Problem_languageId_fkey"
FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem"
ADD CONSTRAINT "Problem_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
