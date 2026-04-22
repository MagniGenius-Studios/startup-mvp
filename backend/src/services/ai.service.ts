import { env } from '@config/env';
import OpenAI from 'openai';
import { z } from 'zod';

// ─── Types ──────────────────────────────────────────────────────

export interface ExplainableFeedback {
    mistake: string;
    concept: string;
    improvement: string;
}

interface CodeSignals {
    readsInput: boolean;
    readsMultipleInputs: boolean;
    writesOutput: boolean;
    usesLoop: boolean;
    usesConditional: boolean;
    usesMultiArgumentPrint: boolean;
    expectsSingleValueOutput: boolean;
}

// ─── Response Validation ────────────────────────────────────────

const feedbackSchema = z.object({
    mistake: z.string().min(1),
    concept: z.string().min(1),
    improvement: z.string().min(1),
});

// ─── Prompt ─────────────────────────────────────────────────────

function buildPrompt(
    problemDescription: string,
    correctSolution: string,
    userCode: string,
    isCorrect: boolean,
    concepts: string[],
): string {
    const conceptList = concepts.length > 0
        ? concepts.join(', ')
        : 'General programming';

    return `You are a strict programming mentor.

Given:

1. Problem Description:
${problemDescription}

2. Correct Reference Solution:
${correctSolution}

3. User's Submitted Code:
${userCode}

4. Whether the solution is correct:
${isCorrect ? 'Yes, the solution is correct.' : 'No, the solution is incorrect.'}

5. Concepts involved in this problem:
${conceptList}

Analyze the user's mistake.

Return ONLY valid JSON:

{
  "mistake": "Explain what is wrong (max 2 lines)",
  "concept": "Main concept involved (choose from provided concepts if possible)",
  "improvement": "Give a specific actionable fix (max 2 lines)"
}

Rules:
- Do NOT give full solution
- Be concise
- Be specific to user's code
- If code is correct, still return improvement suggestion
- For "concept", prefer one of the provided concepts: ${conceptList}`;
}

// ─── Heuristics ─────────────────────────────────────────────────

const normalizeCode = (code: string): string => {
    return code
        .split('\n')
        .map((line) => line.replace(/#.*$/, '').replace(/\/\/.*$/, '').trim())
        .filter((line) => line.length > 0)
        .join('\n')
        .toLowerCase();
};

const hasPlaceholder = (normalizedCode: string): boolean => {
    return /\b(pass|todo|fixme)\b/.test(normalizedCode);
};

function splitTopLevelCsv(args: string): string[] {
    const parts: string[] = [];
    let buffer = '';
    let roundDepth = 0;
    let squareDepth = 0;
    let curlyDepth = 0;
    let quote: '"' | '\'' | '`' | null = null;
    let escaped = false;

    for (const char of args) {
        if (quote) {
            buffer += char;
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === quote) {
                quote = null;
            }
            continue;
        }

        if (char === '"' || char === '\'' || char === '`') {
            quote = char;
            buffer += char;
            continue;
        }

        if (char === '(') {
            roundDepth += 1;
            buffer += char;
            continue;
        }
        if (char === ')') {
            roundDepth = Math.max(0, roundDepth - 1);
            buffer += char;
            continue;
        }
        if (char === '[') {
            squareDepth += 1;
            buffer += char;
            continue;
        }
        if (char === ']') {
            squareDepth = Math.max(0, squareDepth - 1);
            buffer += char;
            continue;
        }
        if (char === '{') {
            curlyDepth += 1;
            buffer += char;
            continue;
        }
        if (char === '}') {
            curlyDepth = Math.max(0, curlyDepth - 1);
            buffer += char;
            continue;
        }

        if (char === ',' && roundDepth === 0 && squareDepth === 0 && curlyDepth === 0) {
            if (buffer.trim()) {
                parts.push(buffer.trim());
            }
            buffer = '';
            continue;
        }

        buffer += char;
    }

    if (buffer.trim()) {
        parts.push(buffer.trim());
    }

    return parts;
}

function getPrintArgumentCounts(code: string): number[] {
    const counts: number[] = [];
    const matches = code.matchAll(/\bprint\s*\(([\s\S]*?)\)/g);

    for (const match of matches) {
        const rawArgs = (match[1] ?? '').trim();
        if (!rawArgs) {
            counts.push(0);
            continue;
        }

        const positionalArgs = splitTopLevelCsv(rawArgs).filter(
            (arg) => !/^\s*(sep|end|file|flush)\s*=/.test(arg),
        );

        counts.push(Math.max(1, positionalArgs.length));
    }

    return counts;
}

function analyzeCodeSignals(code: string): CodeSignals {
    const lower = code.toLowerCase();
    const printCounts = getPrintArgumentCounts(code);

    const readsInput = /\binput\s*\(/.test(lower)
        || /\breadline\s*\(/.test(lower)
        || /\bprompt\s*\(/.test(lower)
        || /\bscanf\s*\(/.test(lower)
        || /\bcin\s*>>/.test(code);

    const pythonInputCount = (lower.match(/\binput\s*\(/g) ?? []).length;

    const writesOutput = /\bprint\s*\(/.test(lower)
        || /\breturn\b/.test(lower)
        || /\bconsole\.log\s*\(/.test(lower)
        || /\bcout\s*<</.test(lower);

    return {
        readsInput,
        readsMultipleInputs: pythonInputCount >= 2,
        writesOutput,
        usesLoop: /\bfor\b|\bwhile\b/.test(lower),
        usesConditional: /\bif\b|\belif\b|\belse\b|\?[\s\S]*:/.test(lower),
        usesMultiArgumentPrint: printCounts.some((count) => count > 1),
        expectsSingleValueOutput: printCounts.length > 0 && printCounts.every((count) => count <= 1),
    };
}

function extractStringLiterals(code: string): string[] {
    const values = new Set<string>();
    const matches = code.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g);

    for (const match of matches) {
        const value = (match[2] ?? '').trim();
        if (!value) continue;
        if (value.length > 80) continue;
        values.add(value.toLowerCase());
    }

    return [...values];
}

function extractArithmeticOperators(code: string): string[] {
    const operators: string[] = [];
    if (code.includes('%')) operators.push('%');
    if (code.includes('+')) operators.push('+');
    if (code.includes('-')) operators.push('-');
    if (code.includes('*')) operators.push('*');
    if (code.includes('/')) operators.push('/');
    return operators;
}

function tokenSimilarityScore(userCode: string, referenceSolution: string): number {
    const toTokenSet = (code: string): Set<string> => {
        const tokens = normalizeCode(code)
            .replace(/[^a-z0-9_]+/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        return new Set(tokens);
    };

    const userTokens = toTokenSet(userCode);
    const refTokens = toTokenSet(referenceSolution);

    if (userTokens.size === 0 || refTokens.size === 0) {
        return 0;
    }

    let intersection = 0;
    for (const token of userTokens) {
        if (refTokens.has(token)) {
            intersection += 1;
        }
    }

    const union = new Set([...userTokens, ...refTokens]).size;
    return union === 0 ? 0 : intersection / union;
}

function getProblemTitle(problemDescription: string): string {
    const firstNonEmptyLine = problemDescription
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0);

    return firstNonEmptyLine ?? '';
}

function getOperatorHint(operator: string): string {
    switch (operator) {
        case '%':
            return 'You likely need a remainder check (`%`) to classify values into cases correctly.';
        case '+':
            return 'You may be missing the addition step needed to compute the required result.';
        case '-':
            return 'Check whether a subtraction step is required by the problem before printing the answer.';
        case '*':
            return 'This problem likely needs a multiplication step. Confirm the final expression includes it.';
        case '/':
            return 'Review whether division is required in the final calculation before output.';
        default:
            return 'Compare your core operation with the expected logic and verify the final expression.';
    }
}

function buildFallbackFeedback(
    problemDescription: string,
    referenceSolution: string,
    userCode: string,
    isCorrect: boolean,
    concepts: string[],
): ExplainableFeedback {
    const normalizedUser = normalizeCode(userCode);
    const title = getProblemTitle(problemDescription).toLowerCase();
    const userSignals = analyzeCodeSignals(userCode);
    const referenceSignals = analyzeCodeSignals(referenceSolution);
    const concept = concepts.length > 0 ? concepts[0] : 'General';

    let mistake: string;
    let improvement: string;

    if (isCorrect) {
        const userLines = userCode.split('\n').filter((line) => line.trim().length > 0).length;
        const refLines = referenceSolution.split('\n').filter((line) => line.trim().length > 0).length;

        if (userLines > refLines + 2 && userSignals.usesConditional) {
            mistake = 'Your solution is correct but has more branches than necessary, reducing readability.';
        } else {
            mistake = 'No errors found. Your solution is correct.';
        }
        improvement = 'Consider using more descriptive variable names and reducing code duplication for better readability.';
        return { mistake, concept, improvement };
    }

    // Default improvement for incorrect solutions
    improvement = 'Try breaking the problem into smaller steps and test each part individually before combining.';

    if (hasPlaceholder(normalizedUser)) {
        mistake = 'Your code still has placeholder logic (`pass`/`TODO`). Replace it with actual implementation before submitting.';
        return { mistake, concept, improvement };
    }

    if (!userSignals.writesOutput) {
        mistake = 'Your logic is incomplete because there is no final output yet. Add a `print(...)` (or equivalent) for the answer.';
        return { mistake, concept: concepts.find(c => c.toLowerCase().includes('output')) ?? concept, improvement };
    }

    if (referenceSignals.readsMultipleInputs && !userSignals.readsMultipleInputs) {
        mistake = 'The task expects multiple input values. Make sure you read all required inputs before applying your logic.';
        return { mistake, concept: concepts.find(c => c.toLowerCase().includes('input')) ?? concept, improvement };
    }

    if (referenceSignals.readsInput && !userSignals.readsInput) {
        mistake = 'This problem requires reading input values first. Add input handling before computing the result.';
        return { mistake, concept: concepts.find(c => c.toLowerCase().includes('input')) ?? concept, improvement };
    }

    const hasEqualityCheck = /\bif\b[^\n]*==|\belif\b[^\n]*==/.test(userCode.toLowerCase());
    if (
        title.includes('largest of two')
        && userSignals.usesMultiArgumentPrint
        && hasEqualityCheck
    ) {
        mistake = 'In the equal-values case, output should still be a single number. Avoid printing both numbers together in one line.';
        return { mistake, concept: concepts.find(c => c.toLowerCase().includes('conditional')) ?? concept, improvement };
    }

    if (referenceSignals.expectsSingleValueOutput && userSignals.usesMultiArgumentPrint) {
        mistake = 'Your output format appears to print multiple values, but this problem expects a single final value.';
        return { mistake, concept, improvement };
    }

    if (referenceSignals.usesConditional && !userSignals.usesConditional) {
        const usesAlternative = /\b(max|min|abs)\s*\(/.test(userCode.toLowerCase());
        if (!usesAlternative) {
            mistake = 'This task has multiple cases to handle. Add conditional logic (`if`/`else` or equivalent) to branch correctly.';
            return { mistake, concept: concepts.find(c => c.toLowerCase().includes('conditional')) ?? concept, improvement };
        }
    }

    if (referenceSignals.usesLoop && !userSignals.usesLoop) {
        mistake = 'You need repeated processing here. Add a loop to handle each required step/item.';
        return { mistake, concept: concepts.find(c => c.toLowerCase().includes('loop')) ?? concept, improvement };
    }

    const referenceOperators = extractArithmeticOperators(referenceSolution);
    for (const operator of referenceOperators) {
        if (!userCode.includes(operator)) {
            mistake = getOperatorHint(operator);
            return { mistake, concept: concepts.find(c => c.toLowerCase().includes('operator') || c.toLowerCase().includes('arithmetic')) ?? concept, improvement };
        }
    }

    const refLiterals = extractStringLiterals(referenceSolution);
    if (refLiterals.length > 0 && !referenceSignals.readsInput) {
        const userLower = userCode.toLowerCase();
        const missingLiteral = refLiterals.find((literal) => !userLower.includes(literal));
        if (missingLiteral) {
            mistake = 'Double-check exact output text and punctuation. The required printed text should match exactly.';
            return { mistake, concept, improvement };
        }
    }

    mistake = 'Review edge cases and output format carefully. Compare what your code prints against the exact expected result.';
    return { mistake, concept, improvement };
}

// ─── Evaluate Correctness ───────────────────────────────────────

export function evaluateCorrectness(
    userCode: string,
    referenceSolution: string,
): boolean {
    const normalizedUser = normalizeCode(userCode);
    const normalizedRef = normalizeCode(referenceSolution);

    if (!normalizedUser || hasPlaceholder(normalizedUser)) {
        return false;
    }

    if (normalizedUser === normalizedRef) {
        return true;
    }

    const userSignals = analyzeCodeSignals(userCode);
    const referenceSignals = analyzeCodeSignals(referenceSolution);

    if (referenceSignals.readsInput && !userSignals.readsInput) {
        return false;
    }

    if (referenceSignals.readsMultipleInputs && !userSignals.readsMultipleInputs) {
        return false;
    }

    if (referenceSignals.writesOutput && !userSignals.writesOutput) {
        return false;
    }

    if (referenceSignals.usesLoop && !userSignals.usesLoop) {
        return false;
    }

    if (referenceSignals.expectsSingleValueOutput && userSignals.usesMultiArgumentPrint) {
        return false;
    }

    if (referenceSignals.usesConditional && !userSignals.usesConditional) {
        const usesAlternativeConditional = /\b(max|min|abs)\s*\(/.test(userCode.toLowerCase());
        if (!usesAlternativeConditional) {
            return false;
        }
    }

    const referenceOperators = extractArithmeticOperators(referenceSolution);
    for (const operator of referenceOperators) {
        if (!userCode.includes(operator)) {
            return false;
        }
    }

    const similarity = tokenSimilarityScore(userCode, referenceSolution);
    return similarity >= 0.35;
}

// ─── Parse AI Response ──────────────────────────────────────────

function parseResponse(raw: string): ExplainableFeedback | null {
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    try {
        const parsed = JSON.parse(cleaned);
        const validated = feedbackSchema.safeParse(parsed);
        if (!validated.success) {
            console.error('[AI] Response validation failed:', validated.error.flatten());
            // Try to extract partial fields if some are present
            if (typeof parsed.mistake === 'string' && parsed.mistake.length > 0) {
                return {
                    mistake: parsed.mistake,
                    concept: parsed.concept ?? 'General',
                    improvement: parsed.improvement ?? 'Review your code structure and variable naming for clarity.',
                };
            }
            return null;
        }
        return validated.data;
    } catch {
        console.error('[AI] Failed to parse JSON:', raw.slice(0, 200));
        return null;
    }
}

// ─── Groq Provider ──────────────────────────────────────────────

async function callGroq(prompt: string): Promise<ExplainableFeedback | null> {
    if (!env.groqApiKey) {
        console.warn('[Groq] No API key configured');
        return null;
    }

    console.info('[Groq] Calling llama-3.3-70b-versatile...');

    const client = new OpenAI({
        apiKey: env.groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
    });

    try {
        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'You are a strict programming mentor. Always respond with valid JSON only. No markdown fencing.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.4,
            max_tokens: 400,
            response_format: { type: 'json_object' },
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) {
            console.error('[Groq] Empty response');
            return null;
        }

        console.info(`[Groq] Raw response: ${raw.slice(0, 150)}`);
        const result = parseResponse(raw);
        if (result) {
            console.info(`[Groq] ✅ Parsed — mistake=${result.mistake.length}c, concept="${result.concept}", improvement=${result.improvement.length}c`);
        }
        return result;
    } catch (error) {
        console.error('[Groq] API error:', error instanceof Error ? error.message : error);
        return null;
    }
}

// ─── Main Function ──────────────────────────────────────────────

export const generateExplainableFeedback = async (
    problemDescription: string,
    correctSolution: string,
    userCode: string,
    isCorrect: boolean,
    concepts: string[] = [],
): Promise<ExplainableFeedback> => {
    console.info(`\n[generateExplainableFeedback] ── START ── isCorrect=${isCorrect}, codeLen=${userCode.length}, concepts=[${concepts.join(', ')}]`);

    const prompt = buildPrompt(problemDescription, correctSolution, userCode, isCorrect, concepts);
    const result = await callGroq(prompt);

    if (result) {
        console.info('[generateExplainableFeedback] ── END ── provider=Groq ✅');
        return result;
    }

    // Fallback: generate structured feedback without LLM
    console.warn('[generateExplainableFeedback] ── END ── provider=FALLBACK ⚠️');
    return buildFallbackFeedback(problemDescription, correctSolution, userCode, isCorrect, concepts);
};
