-- Make Problem language-agnostic by storing starter/solution code as per-language JSON maps.

-- Remove hierarchy constraints first.
ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_languageId_fkey";
ALTER TABLE "Problem" DROP CONSTRAINT IF EXISTS "Problem_categoryId_fkey";

DROP INDEX IF EXISTS "Problem_languageId_idx";
DROP INDEX IF EXISTS "Problem_categoryId_idx";
DROP INDEX IF EXISTS "Problem_categoryId_position_idx";

-- Convert starter code into a multi-language JSON map with sensible defaults.
ALTER TABLE "Problem"
ALTER COLUMN "starterCode" TYPE JSONB
USING jsonb_build_object(
  'python', COALESCE("starterCode", '# Write your code here\n'),
  'cpp', '#include <iostream>\n\nint main() {\n  // Write your code here\n  return 0;\n}\n',
  'java', 'class Main {\n  public static void main(String[] args) {\n    // Write your code here\n  }\n}\n',
  'javascript', '// Write your code here\n',
  'go', 'package main\n\nimport "fmt"\n\nfunc main() {\n  // Write your code here\n}\n'
);

ALTER TABLE "Problem" ALTER COLUMN "starterCode" SET NOT NULL;

-- Convert reference solutions into a multi-language JSON map.
ALTER TABLE "Problem"
ALTER COLUMN "solutionCode" TYPE JSONB
USING jsonb_build_object(
  'python', COALESCE(NULLIF("solutionCode", ''), COALESCE("solutionReference", '')),
  'cpp', '// TODO: add C++ reference solution\n',
  'java', '// TODO: add Java reference solution\n',
  'javascript', '// TODO: add JavaScript reference solution\n',
  'go', '// TODO: add Go reference solution\n'
);

-- Remove obsolete hierarchy/reference columns.
ALTER TABLE "Problem"
DROP COLUMN IF EXISTS "languageId",
DROP COLUMN IF EXISTS "categoryId",
DROP COLUMN IF EXISTS "solutionReference";

-- Remove deprecated hierarchy tables.
DROP TABLE IF EXISTS "Category";
DROP TABLE IF EXISTS "Language";
