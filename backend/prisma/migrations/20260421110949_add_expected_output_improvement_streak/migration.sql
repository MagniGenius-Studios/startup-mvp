-- Adds expected output support, feedback improvements, and streak fields.
-- AlterTable
ALTER TABLE "AiFeedback" ADD COLUMN     "improvement" TEXT;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "expectedOutput" TEXT;

-- CreateTable
CREATE TABLE "UserStreak" (
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
