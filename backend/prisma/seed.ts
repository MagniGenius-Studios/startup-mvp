import { Prisma, PrismaClient } from '@prisma/client';

// Seed script: bootstraps demo org, languages, tracks, problems, and concept links.
const prisma = new PrismaClient();

type LanguageSlug = 'python' | 'cpp' | 'java' | 'javascript' | 'go';
type Difficulty = 'EASY' | 'MEDIUM';
type ProblemTemplateKey =
  | 'printHelloWorld'
  | 'sumOfTwoNumbers'
  | 'checkEvenOrOdd'
  | 'sumOfArray'
  | 'reverseAString'
  | 'countVowels';

type CodeMap = Record<LanguageSlug, string>;

interface SeedLanguage {
  id: string;
  slug: LanguageSlug;
  name: string;
}

interface ProblemTemplate {
  title: string;
  description: string;
  difficulty: Difficulty;
  starterCode: CodeMap;
  solutionCode: CodeMap;
  expectedOutput: string;
}

interface SeedProblemInput {
  templateKey: ProblemTemplateKey;
}

interface SeedTrackInput {
  title: string;
  problems: SeedProblemInput[];
}

interface SeedLanguageInput {
  slug: LanguageSlug;
  tracks: SeedTrackInput[];
}

const code = (...lines: string[]): string => `${lines.join('\n')}\n`;

// Stable IDs keep local reseeding deterministic across environments.
const DEMO_ORGANIZATION = {
  id: 'a0000000-0000-0000-0000-000000000001',
  slug: 'codebyte-demo',
  name: 'CodeByte Demo',
  description: 'Default demo organization for CodeByte platform.',
};

const LANGUAGE_SEEDS: SeedLanguage[] = [
  { id: 'f1000000-0000-0000-0000-000000000001', slug: 'python', name: 'Python' },
  { id: 'f1000000-0000-0000-0000-000000000002', slug: 'cpp', name: 'C++' },
  { id: 'f1000000-0000-0000-0000-000000000003', slug: 'java', name: 'Java' },
  { id: 'f1000000-0000-0000-0000-000000000004', slug: 'javascript', name: 'JavaScript' },
  { id: 'f1000000-0000-0000-0000-000000000005', slug: 'go', name: 'Go' },
];

const LANGUAGE_LABELS: Record<LanguageSlug, string> = {
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  go: 'Go',
};

const TRACK_TITLES: Record<LanguageSlug, string[]> = {
  python: ['Basics', 'Loops', 'Strings', 'Functions'],
  cpp: ['Basics', 'Loops', 'STL', 'Arrays'],
  java: ['Basics', 'Loops', 'OOP Basics', 'Strings'],
  javascript: ['Basics', 'Functions', 'Arrays', 'Objects'],
  go: ['Basics', 'Loops', 'Functions', 'Slices'],
};

// Reusable beginner problem templates mapped to every supported language.
const PROBLEM_LIBRARY: Record<ProblemTemplateKey, ProblemTemplate> = {
  printHelloWorld: {
    title: 'Print Hello World',
    description: 'Print the text `Hello World` to the console.',
    difficulty: 'EASY',
    starterCode: {
      python: code('# Print Hello World', '# TODO: complete the statement', 'print()'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  // TODO: print Hello World',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    // TODO: print Hello World',
        '  }',
        '}',
      ),
      javascript: code('// TODO: print Hello World', 'console.log()'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  // TODO: print Hello World',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code('print("Hello World")'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  cout << "Hello World" << endl;',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    System.out.println("Hello World");',
        '  }',
        '}',
      ),
      javascript: code('console.log("Hello World")'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  fmt.Println("Hello World")',
        '}',
      ),
    },
    expectedOutput: 'Hello World',
  },
  sumOfTwoNumbers: {
    title: 'Sum of Two Numbers',
    description:
      'Create two numbers `a = 5` and `b = 7`, then print their sum as a single value.',
    difficulty: 'EASY',
    starterCode: {
      python: code('a = 5', 'b = 7', '# TODO: print the sum of a and b'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  int a = 5;',
        '  int b = 7;',
        '  // TODO: print the sum',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int a = 5;',
        '    int b = 7;',
        '    // TODO: print the sum',
        '  }',
        '}',
      ),
      javascript: code('const a = 5', 'const b = 7', '// TODO: print the sum'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  a := 5',
        '  b := 7',
        '  _ = a',
        '  _ = b',
        '  // TODO: print the sum',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code('a = 5', 'b = 7', 'print(a + b)'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  int a = 5;',
        '  int b = 7;',
        '  cout << a + b << endl;',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int a = 5;',
        '    int b = 7;',
        '    System.out.println(a + b);',
        '  }',
        '}',
      ),
      javascript: code('const a = 5', 'const b = 7', 'console.log(a + b)'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  a := 5',
        '  b := 7',
        '  fmt.Println(a + b)',
        '}',
      ),
    },
    expectedOutput: '12',
  },
  checkEvenOrOdd: {
    title: 'Check Even or Odd',
    description:
      'Set `n = 8` and print `Even` if the number is even, otherwise print `Odd`.',
    difficulty: 'EASY',
    starterCode: {
      python: code('n = 8', '# TODO: print "Even" or "Odd" based on n'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  int n = 8;',
        '  // TODO: print Even or Odd',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int n = 8;',
        '    // TODO: print Even or Odd',
        '  }',
        '}',
      ),
      javascript: code('const n = 8', '// TODO: print "Even" or "Odd"'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  n := 8',
        '  _ = n',
        '  // TODO: print Even or Odd',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code('n = 8', 'if n % 2 == 0:', '    print("Even")', 'else:', '    print("Odd")'),
      cpp: code(
        '#include <iostream>',
        'using namespace std;',
        '',
        'int main() {',
        '  int n = 8;',
        '  if (n % 2 == 0) {',
        '    cout << "Even" << endl;',
        '  } else {',
        '    cout << "Odd" << endl;',
        '  }',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int n = 8;',
        '    if (n % 2 == 0) {',
        '      System.out.println("Even");',
        '    } else {',
        '      System.out.println("Odd");',
        '    }',
        '  }',
        '}',
      ),
      javascript: code('const n = 8', 'if (n % 2 === 0) {', '  console.log("Even")', '} else {', '  console.log("Odd")', '}'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  n := 8',
        '  if n%2 == 0 {',
        '    fmt.Println("Even")',
        '  } else {',
        '    fmt.Println("Odd")',
        '  }',
        '}',
      ),
    },
    expectedOutput: 'Even',
  },
  sumOfArray: {
    title: 'Sum of Array',
    description:
      'Use the array `[1, 2, 3, 4, 5]` and print the total sum of all elements.',
    difficulty: 'EASY',
    starterCode: {
      python: code('numbers = [1, 2, 3, 4, 5]', '# TODO: print the sum of numbers'),
      cpp: code(
        '#include <iostream>',
        '#include <vector>',
        'using namespace std;',
        '',
        'int main() {',
        '  vector<int> numbers{1, 2, 3, 4, 5};',
        '  // TODO: print the sum',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int[] numbers = {1, 2, 3, 4, 5};',
        '    // TODO: print the sum',
        '  }',
        '}',
      ),
      javascript: code('const numbers = [1, 2, 3, 4, 5]', '// TODO: print the sum'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  numbers := []int{1, 2, 3, 4, 5}',
        '  _ = numbers',
        '  // TODO: print the sum',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code('numbers = [1, 2, 3, 4, 5]', 'print(sum(numbers))'),
      cpp: code(
        '#include <iostream>',
        '#include <vector>',
        'using namespace std;',
        '',
        'int main() {',
        '  vector<int> numbers{1, 2, 3, 4, 5};',
        '  int total = 0;',
        '  for (int value : numbers) {',
        '    total += value;',
        '  }',
        '  cout << total << endl;',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    int[] numbers = {1, 2, 3, 4, 5};',
        '    int total = 0;',
        '    for (int value : numbers) {',
        '      total += value;',
        '    }',
        '    System.out.println(total);',
        '  }',
        '}',
      ),
      javascript: code(
        'const numbers = [1, 2, 3, 4, 5]',
        'const total = numbers.reduce((sum, value) => sum + value, 0)',
        'console.log(total)',
      ),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  numbers := []int{1, 2, 3, 4, 5}',
        '  total := 0',
        '  for _, value := range numbers {',
        '    total += value',
        '  }',
        '  fmt.Println(total)',
        '}',
      ),
    },
    expectedOutput: '15',
  },
  reverseAString: {
    title: 'Reverse a String',
    description:
      'Set `text = "code"` and print the reversed string so the output is `edoc`.',
    difficulty: 'MEDIUM',
    starterCode: {
      python: code('text = "code"', '# TODO: print text in reverse order'),
      cpp: code(
        '#include <iostream>',
        '#include <string>',
        'using namespace std;',
        '',
        'int main() {',
        '  string text = "code";',
        '  // TODO: reverse text and print it',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    String text = "code";',
        '    // TODO: reverse text and print it',
        '  }',
        '}',
      ),
      javascript: code('const text = "code"', '// TODO: reverse text and print it'),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  text := "code"',
        '  _ = text',
        '  // TODO: reverse text and print it',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code('text = "code"', 'print(text[::-1])'),
      cpp: code(
        '#include <algorithm>',
        '#include <iostream>',
        '#include <string>',
        'using namespace std;',
        '',
        'int main() {',
        '  string text = "code";',
        '  reverse(text.begin(), text.end());',
        '  cout << text << endl;',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    String text = "code";',
        '    String reversed = new StringBuilder(text).reverse().toString();',
        '    System.out.println(reversed);',
        '  }',
        '}',
      ),
      javascript: code(
        'const text = "code"',
        'const reversed = text.split("").reverse().join("")',
        'console.log(reversed)',
      ),
      go: code(
        'package main',
        '',
        'import "fmt"',
        '',
        'func main() {',
        '  text := "code"',
        '  runes := []rune(text)',
        '  for left, right := 0, len(runes)-1; left < right; left, right = left+1, right-1 {',
        '    runes[left], runes[right] = runes[right], runes[left]',
        '  }',
        '  fmt.Println(string(runes))',
        '}',
      ),
    },
    expectedOutput: 'edoc',
  },
  countVowels: {
    title: 'Count Vowels',
    description:
      'Set `text = "education"` and print how many vowels are present in the string.',
    difficulty: 'MEDIUM',
    starterCode: {
      python: code('text = "education"', '# TODO: count vowels and print the result'),
      cpp: code(
        '#include <cctype>',
        '#include <iostream>',
        '#include <string>',
        'using namespace std;',
        '',
        'int main() {',
        '  string text = "education";',
        '  // TODO: count vowels and print the result',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    String text = "education";',
        '    // TODO: count vowels and print the result',
        '  }',
        '}',
      ),
      javascript: code('const text = "education"', '// TODO: count vowels and print the result'),
      go: code(
        'package main',
        '',
        'import (',
        '  "fmt"',
        '  "strings"',
        ')',
        '',
        'func main() {',
        '  text := "education"',
        '  _ = strings.ContainsRune',
        '  _ = text',
        '  // TODO: count vowels and print the result',
        '  fmt.Println()',
        '}',
      ),
    },
    solutionCode: {
      python: code(
        'text = "education"',
        'vowels = "aeiouAEIOU"',
        'count = sum(1 for char in text if char in vowels)',
        'print(count)',
      ),
      cpp: code(
        '#include <cctype>',
        '#include <iostream>',
        '#include <string>',
        'using namespace std;',
        '',
        'int main() {',
        '  string text = "education";',
        '  int count = 0;',
        '  for (char ch : text) {',
        '    char lower = static_cast<char>(tolower(static_cast<unsigned char>(ch)));',
        "    if (lower == 'a' || lower == 'e' || lower == 'i' || lower == 'o' || lower == 'u') {",
        '      count++;',
        '    }',
        '  }',
        '  cout << count << endl;',
        '  return 0;',
        '}',
      ),
      java: code(
        'class Main {',
        '  public static void main(String[] args) {',
        '    String text = "education";',
        '    String vowels = "aeiou";',
        '    int count = 0;',
        '    for (int i = 0; i < text.length(); i++) {',
        '      char ch = Character.toLowerCase(text.charAt(i));',
        '      if (vowels.indexOf(ch) >= 0) {',
        '        count++;',
        '      }',
        '    }',
        '    System.out.println(count);',
        '  }',
        '}',
      ),
      javascript: code(
        'const text = "education"',
        'const vowels = "aeiou"',
        'let count = 0',
        'for (const ch of text.toLowerCase()) {',
        '  if (vowels.includes(ch)) {',
        '    count += 1',
        '  }',
        '}',
        'console.log(count)',
      ),
      go: code(
        'package main',
        '',
        'import (',
        '  "fmt"',
        '  "strings"',
        ')',
        '',
        'func main() {',
        '  text := "education"',
        '  vowels := "aeiouAEIOU"',
        '  count := 0',
        '  for _, ch := range text {',
        '    if strings.ContainsRune(vowels, ch) {',
        '      count++',
        '    }',
        '  }',
        '  fmt.Println(count)',
        '}',
      ),
    },
    expectedOutput: '5',
  },
};

const TRACK_PROBLEM_COUNT = 5;
const SEED_BLUEPRINT: SeedLanguageInput[] = [
  {
    slug: 'python',
    tracks: [
      {
        title: 'Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
        ],
      },
      {
        title: 'Loops',
        problems: [
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Strings',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Functions',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
    ],
  },
  {
    slug: 'cpp',
    tracks: [
      {
        title: 'Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Loops',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'STL',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Arrays',
        problems: [
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
    ],
  },
  {
    slug: 'java',
    tracks: [
      {
        title: 'Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
        ],
      },
      {
        title: 'Loops',
        problems: [
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'OOP Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Strings',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
    ],
  },
  {
    slug: 'javascript',
    tracks: [
      {
        title: 'Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Functions',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Arrays',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Objects',
        problems: [
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
    ],
  },
  {
    slug: 'go',
    tracks: [
      {
        title: 'Basics',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
        ],
      },
      {
        title: 'Loops',
        problems: [
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Functions',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'checkEvenOrOdd' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
      {
        title: 'Slices',
        problems: [
          { templateKey: 'printHelloWorld' },
          { templateKey: 'sumOfTwoNumbers' },
          { templateKey: 'sumOfArray' },
          { templateKey: 'reverseAString' },
          { templateKey: 'countVowels' },
        ],
      },
    ],
  },
];

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const hasCompleteCodeMap = (value: unknown): value is CodeMap => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return LANGUAGE_SEEDS.every(({ slug }) => {
    const candidate = value[slug];
    return typeof candidate === 'string' && candidate.trim().length > 0;
  });
};

const buildTrackDescription = (languageSlug: LanguageSlug, trackTitle: string): string => {
  return `Beginner-friendly ${LANGUAGE_LABELS[languageSlug]} ${trackTitle} exercises with runnable examples.`;
};

const buildProblemTitle = (
  languageSlug: LanguageSlug,
  trackTitle: string,
  templateKey: ProblemTemplateKey,
): string => {
  const baseTitle = PROBLEM_LIBRARY[templateKey].title;
  return `${LANGUAGE_LABELS[languageSlug]} ${trackTitle}: ${baseTitle}`;
};

const buildProblemDescription = (
  languageSlug: LanguageSlug,
  trackTitle: string,
  templateKey: ProblemTemplateKey,
): string => {
  const baseDescription = PROBLEM_LIBRARY[templateKey].description;
  return `${baseDescription}\n\nTrack: ${LANGUAGE_LABELS[languageSlug]} / ${trackTitle}`;
};

const validateSeedBlueprint = (): void => {
  const titlesByLanguage = new Map<LanguageSlug, Set<string>>();
  for (const { slug, tracks } of SEED_BLUEPRINT) {
    const expectedTitles = new Set(TRACK_TITLES[slug]);
    const actualTitles = new Set<string>();

    for (const track of tracks) {
      actualTitles.add(track.title);

      if (track.problems.length !== TRACK_PROBLEM_COUNT) {
        throw new Error(
          `Seed blueprint invalid: ${slug}/${track.title} must contain exactly ${TRACK_PROBLEM_COUNT} problems.`,
        );
      }

      const seen = new Set<ProblemTemplateKey>();
      for (const problem of track.problems) {
        if (seen.has(problem.templateKey)) {
          throw new Error(`Seed blueprint invalid: duplicate template in ${slug}/${track.title}.`);
        }

        seen.add(problem.templateKey);
      }
    }

    if (actualTitles.size !== expectedTitles.size) {
      throw new Error(`Seed blueprint invalid: track count mismatch for ${slug}.`);
    }

    for (const title of expectedTitles) {
      if (!actualTitles.has(title)) {
        throw new Error(`Seed blueprint invalid: missing track "${title}" for ${slug}.`);
      }
    }

    titlesByLanguage.set(slug, actualTitles);
  }

  if (titlesByLanguage.size !== LANGUAGE_SEEDS.length) {
    throw new Error('Seed blueprint invalid: every seeded language must have track definitions.');
  }
};

async function ensureDemoOrganization(): Promise<string> {
  const existing = await prisma.organization.findUnique({
    where: { slug: DEMO_ORGANIZATION.slug },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const created = await prisma.organization.create({
    data: {
      id: DEMO_ORGANIZATION.id,
      slug: DEMO_ORGANIZATION.slug,
      name: DEMO_ORGANIZATION.name,
      description: DEMO_ORGANIZATION.description,
    },
    select: { id: true },
  });

  return created.id;
}

async function ensureLanguages(): Promise<Record<LanguageSlug, string>> {
  const languageIds = {} as Record<LanguageSlug, string>;

  for (const language of LANGUAGE_SEEDS) {
    const existing = await prisma.language.findUnique({
      where: { slug: language.slug },
      select: { id: true },
    });

    if (existing) {
      languageIds[language.slug] = existing.id;
      continue;
    }

    const created = await prisma.language.create({
      data: {
        id: language.id,
        slug: language.slug,
        name: language.name,
      },
      select: { id: true },
    });

    languageIds[language.slug] = created.id;
  }

  return languageIds;
}

async function resetSeedData(): Promise<void> {
  const problemDeleteResult = await prisma.problem.deleteMany();
  const trackDeleteResult = await prisma.track.deleteMany();
  const languageDeleteResult = await prisma.language.deleteMany();

  console.log(`  ✓ Cleared ${problemDeleteResult.count} existing problems`);
  console.log(`  ✓ Cleared ${trackDeleteResult.count} existing tracks`);
  console.log(`  ✓ Cleared ${languageDeleteResult.count} existing languages`);
}

async function seedTracksAndProblems(
  organizationId: string,
  languageIds: Record<LanguageSlug, string>,
): Promise<void> {
  let seededTrackCount = 0;
  let seededProblemCount = 0;

  for (const language of SEED_BLUEPRINT) {
    const languageId = languageIds[language.slug];

    for (const trackInput of language.tracks) {
      const track = await prisma.track.create({
        data: {
          organizationId,
          languageId,
          title: trackInput.title,
          description: buildTrackDescription(language.slug, trackInput.title),
          isPublished: true,
        },
        select: { id: true },
      });

      seededTrackCount += 1;

      const problemRows: Prisma.ProblemCreateManyInput[] = [];

      for (let index = 0; index < trackInput.problems.length; index += 1) {
        const problemInput = trackInput.problems[index];
        const template = PROBLEM_LIBRARY[problemInput.templateKey];

        problemRows.push({
          trackId: track.id,
          title: buildProblemTitle(language.slug, trackInput.title, problemInput.templateKey),
          description: buildProblemDescription(language.slug, trackInput.title, problemInput.templateKey),
          difficulty: template.difficulty,
          starterCode: template.starterCode,
          solutionCode: template.solutionCode,
          expectedOutput: template.expectedOutput,
          position: index + 1,
        });
      }

      await prisma.problem.createMany({ data: problemRows });
      seededProblemCount += problemRows.length;
    }
  }

  console.log(`  ✓ ${seededTrackCount} tracks created`);
  console.log(`  ✓ ${seededProblemCount} problems created`);
}

async function validateSeedInvariants(
  organizationId: string,
  languageIds: Record<LanguageSlug, string>,
): Promise<void> {
  const expectedTrackCount = SEED_BLUEPRINT.reduce((total, language) => {
    return total + language.tracks.length;
  }, 0);
  const expectedProblemCount = SEED_BLUEPRINT.reduce((total, language) => {
    return total + language.tracks.reduce((trackTotal, track) => trackTotal + track.problems.length, 0);
  }, 0);
  const expectedLanguageSlugs = LANGUAGE_SEEDS.map((language) => language.slug).sort();

  const languageRows = await prisma.language.findMany({
    where: {
      slug: {
        in: expectedLanguageSlugs,
      },
    },
    select: {
      slug: true,
    },
  });

  const actualLanguageSlugs = languageRows.map((language) => language.slug).sort();
  if (actualLanguageSlugs.length !== expectedLanguageSlugs.length) {
    throw new Error('Language validation failed: expected exactly 5 seeded languages.');
  }

  if (actualLanguageSlugs.join(',') !== expectedLanguageSlugs.join(',')) {
    throw new Error('Language validation failed: language slugs do not match expected set.');
  }

  const scopedLanguageIds = Object.values(languageIds);

  const tracks = await prisma.track.findMany({
    where: {
      organizationId,
      languageId: {
        in: scopedLanguageIds,
      },
    },
    select: {
      id: true,
      title: true,
      language: {
        select: {
          slug: true,
        },
      },
      _count: {
        select: {
          problems: true,
        },
      },
    },
  });

  if (tracks.length !== expectedTrackCount) {
    throw new Error(`Track validation failed: expected ${expectedTrackCount} tracks, found ${tracks.length}.`);
  }

  for (const language of LANGUAGE_SEEDS) {
    const requiredTrackTitles = TRACK_TITLES[language.slug];
    const languageTrackTitles = tracks
      .filter((track) => track.language.slug === language.slug)
      .map((track) => track.title);

    if (languageTrackTitles.length !== requiredTrackTitles.length) {
      throw new Error(
        `Track validation failed: ${language.slug} should have ${requiredTrackTitles.length} tracks, found ${languageTrackTitles.length}.`,
      );
    }

    for (const requiredTrackTitle of requiredTrackTitles) {
      if (!languageTrackTitles.includes(requiredTrackTitle)) {
        throw new Error(
          `Track validation failed: missing track \"${requiredTrackTitle}\" for language ${language.slug}.`,
        );
      }
    }
  }

  const tracksWithBadProblemCount = tracks.filter((track) => track._count.problems !== TRACK_PROBLEM_COUNT);
  if (tracksWithBadProblemCount.length > 0) {
    throw new Error(`Track validation failed: every track must contain exactly ${TRACK_PROBLEM_COUNT} problems.`);
  }

  const [nullTrackMappings] = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS "count"
    FROM "Problem" p
    WHERE p."trackId" IS NULL
  `;

  if (nullTrackMappings.count > 0) {
    throw new Error(`Problem mapping validation failed: found ${nullTrackMappings.count} rows with null trackId.`);
  }

  const [orphanTrackMappings] = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS "count"
    FROM "Problem" p
    LEFT JOIN "Track" t ON t."id" = p."trackId"
    WHERE p."trackId" IS NOT NULL
      AND t."id" IS NULL
  `;

  if (orphanTrackMappings.count > 0) {
    throw new Error(
      `Problem mapping validation failed: found ${orphanTrackMappings.count} rows with orphan track references.`,
    );
  }

  const duplicateTrackTitleMappings = await prisma.$queryRaw<
    Array<{ trackId: string; title: string; count: number }>
  >(Prisma.sql`
    SELECT p."trackId", p."title", COUNT(*)::int AS "count"
    FROM "Problem" p
    INNER JOIN "Track" t ON t."id" = p."trackId"
    WHERE t."organizationId" = ${organizationId}
      AND t."languageId" IN (${Prisma.join(scopedLanguageIds)})
    GROUP BY p."trackId", p."title"
    HAVING COUNT(*) > 1
  `);

  if (duplicateTrackTitleMappings.length > 0) {
    throw new Error('Problem mapping validation failed: duplicate title mappings found inside a track.');
  }

  const duplicateTitlesAcrossTracks = await prisma.$queryRaw<
    Array<{ title: string; trackCount: number }>
  >(Prisma.sql`
    SELECT p."title", COUNT(DISTINCT p."trackId")::int AS "trackCount"
    FROM "Problem" p
    INNER JOIN "Track" t ON t."id" = p."trackId"
    WHERE t."organizationId" = ${organizationId}
      AND t."languageId" IN (${Prisma.join(scopedLanguageIds)})
    GROUP BY p."title"
    HAVING COUNT(DISTINCT p."trackId") > 1
  `);

  if (duplicateTitlesAcrossTracks.length > 0) {
    throw new Error('Problem validation failed: duplicate problem titles found across different tracks.');
  }

  const scopedProblems = await prisma.problem.findMany({
    where: {
      track: {
        organizationId,
        languageId: {
          in: scopedLanguageIds,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      expectedOutput: true,
      starterCode: true,
      solutionCode: true,
    },
  });

  if (scopedProblems.length !== expectedProblemCount) {
    throw new Error(
      `Problem validation failed: expected ${expectedProblemCount} problems, found ${scopedProblems.length}.`,
    );
  }

  for (const problem of scopedProblems) {
    if (problem.title.trim().length === 0) {
      throw new Error(`Problem validation failed: empty title for problem ${problem.id}.`);
    }

    if (problem.description.trim().length === 0) {
      throw new Error(`Problem validation failed: empty description for problem ${problem.id}.`);
    }

    if (problem.expectedOutput === null || problem.expectedOutput.trim().length === 0) {
      throw new Error(`Problem validation failed: missing expectedOutput for problem ${problem.id}.`);
    }

    if (problem.difficulty !== 'EASY' && problem.difficulty !== 'MEDIUM') {
      throw new Error(`Problem validation failed: invalid difficulty on problem ${problem.id}.`);
    }

    if (!hasCompleteCodeMap(problem.starterCode)) {
      throw new Error(`Problem validation failed: incomplete starterCode map on problem ${problem.id}.`);
    }

    if (!hasCompleteCodeMap(problem.solutionCode)) {
      throw new Error(`Problem validation failed: incomplete solutionCode map on problem ${problem.id}.`);
    }
  }

  console.log('  ✓ Validation passed (languages, tracks, strict mappings, unique titles, code maps)');
}

async function main() {
  console.log('🌱 Seeding database...');
  validateSeedBlueprint();

  const organizationId = await ensureDemoOrganization();
  console.log('  ✓ Demo organization resolved');

  await resetSeedData();

  const languageIds = await ensureLanguages();
  console.log('  ✓ Languages resolved/created');

  await seedTracksAndProblems(organizationId, languageIds);
  await validateSeedInvariants(organizationId, languageIds);

  console.log('\n✅ Seed complete!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
