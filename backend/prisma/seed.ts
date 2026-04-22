import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_IDS = {
  organization: 'a0000000-0000-0000-0000-000000000001',
  track: 'b0000000-0000-0000-0000-000000000001',
  module: 'c0000000-0000-0000-0000-000000000001',
  lesson: 'd0000000-0000-0000-0000-000000000001',
  languagePython: 'f0000000-0000-0000-0000-000000000001',
  categoryBasics: 'f0000000-0000-0000-0000-000000000101',
  categoryVariables: 'f0000000-0000-0000-0000-000000000102',
  categoryInputOutput: 'f0000000-0000-0000-0000-000000000103',
  categoryConditions: 'f0000000-0000-0000-0000-000000000104',
  categoryLoops: 'f0000000-0000-0000-0000-000000000105',
};

function problemId(index: number): string {
  return `e0000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
}

interface SeedProblem {
  title: string;
  description: string;
  difficulty: string;
  starterCode: string;
  solutionCode: string;
}

const PYTHON_CATEGORIES: Array<{ id: string; name: string; problems: SeedProblem[] }> = [
  {
    id: SEED_IDS.categoryBasics,
    name: 'Basics',
    problems: [
      {
        title: 'Hello World',
        difficulty: 'Easy',
        description:
          'Write a Python program that prints `Hello, World!` exactly once.',
        starterCode: '# Print Hello, World!\n',
        solutionCode: 'print("Hello, World!")',
      },
      {
        title: 'Print Your Name',
        difficulty: 'Easy',
        description:
          'Print the sentence `My name is CodeByte` to the console.',
        starterCode: '# Print: My name is CodeByte\n',
        solutionCode: 'print("My name is CodeByte")',
      },
      {
        title: 'Print Two Lines',
        difficulty: 'Easy',
        description:
          'Print two lines: first `Hello` and then `World`.',
        starterCode: '# Use two print() calls\n',
        solutionCode: 'print("Hello")\nprint("World")',
      },
      {
        title: 'Star Ladder',
        difficulty: 'Easy',
        description:
          'Print the pattern with one star per line increase:\n*\n**\n***',
        starterCode: '# Print the 3-line star ladder\n',
        solutionCode: 'print("*")\nprint("**")\nprint("***")',
      },
    ],
  },
  {
    id: SEED_IDS.categoryVariables,
    name: 'Variables',
    problems: [
      {
        title: 'Swap Two Numbers',
        difficulty: 'Easy',
        description:
          'Given `a = 5` and `b = 9`, swap values and print as `a=9 b=5`.',
        starterCode: 'a = 5\nb = 9\n# swap a and b, then print\n',
        solutionCode: 'a = 5\nb = 9\na, b = b, a\nprint(f"a={a} b={b}")',
      },
      {
        title: 'Rectangle Area',
        difficulty: 'Easy',
        description:
          'Use variables `length = 7` and `width = 4` and print the area.',
        starterCode: 'length = 7\nwidth = 4\n# print area\n',
        solutionCode: 'length = 7\nwidth = 4\nprint(length * width)',
      },
      {
        title: 'Celsius to Fahrenheit',
        difficulty: 'Medium',
        description:
          'Given `c = 30`, convert to Fahrenheit using `(c * 9/5) + 32` and print.',
        starterCode: 'c = 30\n# convert and print\n',
        solutionCode: 'c = 30\nf = (c * 9 / 5) + 32\nprint(f)',
      },
      {
        title: 'Sum and Product',
        difficulty: 'Easy',
        description:
          'Given `x = 6` and `y = 3`, print sum and product on separate lines.',
        starterCode: 'x = 6\ny = 3\n# print x + y and x * y\n',
        solutionCode: 'x = 6\ny = 3\nprint(x + y)\nprint(x * y)',
      },
    ],
  },
  {
    id: SEED_IDS.categoryInputOutput,
    name: 'Input/Output',
    problems: [
      {
        title: 'Echo Input',
        difficulty: 'Easy',
        description:
          'Read one line of input and print the same value back.',
        starterCode: '# read one value from input and print it\n',
        solutionCode: 'value = input()\nprint(value)',
      },
      {
        title: 'Add Two Inputs',
        difficulty: 'Easy',
        description:
          'Read two integers and print their sum.',
        starterCode: '# read two integers and print sum\n',
        solutionCode: 'a = int(input())\nb = int(input())\nprint(a + b)',
      },
      {
        title: 'Full Name Formatter',
        difficulty: 'Easy',
        description:
          'Read first name and last name, then print `Hello, <first> <last>!`.',
        starterCode: '# read first and last name\n# print greeting\n',
        solutionCode: 'first = input()\nlast = input()\nprint(f"Hello, {first} {last}!")',
      },
      {
        title: 'Number and Square',
        difficulty: 'Easy',
        description:
          'Read one integer and print the number and its square separated by space.',
        starterCode: '# read an integer and print number and square\n',
        solutionCode: 'n = int(input())\nprint(n, n * n)',
      },
    ],
  },
  {
    id: SEED_IDS.categoryConditions,
    name: 'Conditions',
    problems: [
      {
        title: 'Even or Odd',
        difficulty: 'Easy',
        description:
          'Read an integer and print `Even` if divisible by 2, otherwise `Odd`.',
        starterCode: '# read integer and print Even or Odd\n',
        solutionCode: 'n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
      },
      {
        title: 'Positive Negative Zero',
        difficulty: 'Easy',
        description:
          'Read an integer and print `Positive`, `Negative`, or `Zero`.',
        starterCode: '# classify number sign\n',
        solutionCode:
          'n = int(input())\nif n > 0:\n    print("Positive")\nelif n < 0:\n    print("Negative")\nelse:\n    print("Zero")',
      },
      {
        title: 'Largest of Two Numbers',
        difficulty: 'Easy',
        description:
          'Read two integers and print the larger one. If equal, print either.',
        starterCode: '# read two numbers and print the larger\n',
        solutionCode: 'a = int(input())\nb = int(input())\nprint(a if a >= b else b)',
      },
      {
        title: 'Grade Classifier',
        difficulty: 'Medium',
        description:
          'Read score (0-100). Print `A` for >=90, `B` for >=75, `C` for >=50 else `D`.',
        starterCode: '# classify score into A/B/C/D\n',
        solutionCode:
          'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 75:\n    print("B")\nelif score >= 50:\n    print("C")\nelse:\n    print("D")',
      },
    ],
  },
  {
    id: SEED_IDS.categoryLoops,
    name: 'Loops',
    problems: [
      {
        title: 'Sum 1 to N',
        difficulty: 'Easy',
        description:
          'Read `n` and print the sum of numbers from 1 to n.',
        starterCode: '# read n and print sum from 1 to n\n',
        solutionCode: 'n = int(input())\nprint(sum(range(1, n + 1)))',
      },
      {
        title: 'Multiplication Table',
        difficulty: 'Medium',
        description:
          'Read `n` and print `n x i = value` for i from 1 to 10.',
        starterCode: '# read n and print multiplication table\n',
        solutionCode:
          'n = int(input())\nfor i in range(1, 11):\n    print(f"{n} x {i} = {n * i}")',
      },
      {
        title: 'Count Vowels',
        difficulty: 'Medium',
        description:
          'Read a word and print how many vowels (a, e, i, o, u) it contains.',
        starterCode: '# read a word and count vowels\n',
        solutionCode:
          'word = input().lower()\nvowels = "aeiou"\ncount = 0\nfor ch in word:\n    if ch in vowels:\n        count += 1\nprint(count)',
      },
      {
        title: 'Factorial of N',
        difficulty: 'Medium',
        description:
          'Read `n` and print `n!` using a loop.',
        starterCode: '# read n and compute factorial\n',
        solutionCode:
          'n = int(input())\nresult = 1\nfor i in range(2, n + 1):\n    result *= i\nprint(result)',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.organization.upsert({
    where: { id: SEED_IDS.organization },
    update: {},
    create: {
      id: SEED_IDS.organization,
      name: 'CodeByte Demo',
      slug: 'codebyte-demo',
      description: 'Default demo organization for CodeByte platform.',
    },
  });
  console.log('  ✓ Organization seeded');

  await prisma.track.upsert({
    where: { id: SEED_IDS.track },
    update: {},
    create: {
      id: SEED_IDS.track,
      organizationId: SEED_IDS.organization,
      title: 'Python Fundamentals',
      description: 'Structured practice path for Python learners.',
      isPublished: true,
    },
  });
  console.log('  ✓ Track seeded');

  await prisma.module.upsert({
    where: { id: SEED_IDS.module },
    update: {},
    create: {
      id: SEED_IDS.module,
      trackId: SEED_IDS.track,
      title: 'Problem Practice',
      description: 'Practice problems organized by language and category.',
      position: 1,
    },
  });
  console.log('  ✓ Module seeded');

  await prisma.lesson.upsert({
    where: { id: SEED_IDS.lesson },
    update: {},
    create: {
      id: SEED_IDS.lesson,
      moduleId: SEED_IDS.module,
      title: 'Python Practice Workspace',
      description: 'Practice Python problems across fundamentals topics.',
      content: 'Use the new language/category browser to pick problems.',
      position: 1,
    },
  });
  console.log('  ✓ Lesson seeded');

  await prisma.language.upsert({
    where: { id: SEED_IDS.languagePython },
    update: { name: 'Python' },
    create: {
      id: SEED_IDS.languagePython,
      name: 'Python',
    },
  });
  console.log('  ✓ Language seeded');

  for (const category of PYTHON_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        languageId: SEED_IDS.languagePython,
      },
      create: {
        id: category.id,
        name: category.name,
        languageId: SEED_IDS.languagePython,
      },
    });
  }
  console.log(`  ✓ ${PYTHON_CATEGORIES.length} categories seeded`);

  const catalogRows: Array<{ id: string; title: string; categoryName: string; position: number }> = [];

  let problemIndex = 0;
  for (const category of PYTHON_CATEGORIES) {
    for (let position = 0; position < category.problems.length; position += 1) {
      problemIndex += 1;
      const seedProblem = category.problems[position];
      const id = problemId(problemIndex);

      await prisma.problem.upsert({
        where: { id },
        update: {
          lessonId: SEED_IDS.lesson,
          languageId: SEED_IDS.languagePython,
          categoryId: category.id,
          title: seedProblem.title,
          description: seedProblem.description,
          starterCode: seedProblem.starterCode,
          solutionCode: seedProblem.solutionCode,
          solutionReference: seedProblem.solutionCode,
          difficulty: seedProblem.difficulty,
          position: position + 1,
        },
        create: {
          id,
          lessonId: SEED_IDS.lesson,
          languageId: SEED_IDS.languagePython,
          categoryId: category.id,
          title: seedProblem.title,
          description: seedProblem.description,
          starterCode: seedProblem.starterCode,
          solutionCode: seedProblem.solutionCode,
          solutionReference: seedProblem.solutionCode,
          difficulty: seedProblem.difficulty,
          position: position + 1,
        },
      });

      catalogRows.push({
        id,
        title: seedProblem.title,
        categoryName: category.name,
        position: position + 1,
      });
    }
  }

  console.log(`  ✓ ${catalogRows.length} problems seeded`);

  console.log('\n✅ Seed complete!');
  console.log('\n📋 Seeded Problems:');
  catalogRows.forEach((row) => {
    console.log(`   ${row.id} | ${row.categoryName} #${row.position} | ${row.title}`);
  });
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
