import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo.user@codebyte.dev" },
    update: { name: "Demo User" },
    create: {
      email: "demo.user@codebyte.dev",
      name: "Demo User",
    },
  });

  const demoProblem = await prisma.problem.upsert({
    where: { slug: "sum-two-numbers" },
    update: {
      title: "Sum Two Numbers",
      description: "Write a function that returns the sum of two numbers.",
      difficulty: "beginner",
    },
    create: {
      slug: "sum-two-numbers",
      title: "Sum Two Numbers",
      description: "Write a function that returns the sum of two numbers.",
      difficulty: "beginner",
    },
  });

  console.log("Seed complete", {
    userId: demoUser.id,
    problemId: demoProblem.id,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
