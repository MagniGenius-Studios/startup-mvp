import type { Prisma } from '@prisma/client';

import { type SupportedLanguage } from '@constants/languages';
import { evaluateCorrectness } from './ai.service';

export interface SubmissionEvaluationInput {
  code: string;
  language: SupportedLanguage;
  solutionCode: Prisma.JsonValue;
  expectedOutput?: string | null;
}

export interface SubmissionEvaluationResult {
  isCorrect: boolean;
  userOutput: string | null;
  expectedOutput: string | null;
  referenceSolution: string;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeOutput = (text: string): string => {
  return text
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n');
};

export const getLanguageCodeFromJson = (
  jsonValue: Prisma.JsonValue,
  language: SupportedLanguage,
): string | null => {
  if (typeof jsonValue === 'string') {
    return language === 'python' ? jsonValue : null;
  }

  if (!isObjectRecord(jsonValue)) {
    return null;
  }

  const value = jsonValue[language];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return null;
};

const extractPythonPrints = (line: string): string | null => {
  const literalMatch = line.match(/^print\s*\(\s*(?:f?)(["'])(.*?)\1\s*\)$/);
  if (literalMatch) {
    return literalMatch[2];
  }

  const expressionMatch = line.match(/^print\s*\(\s*(.+?)\s*\)$/);
  if (!expressionMatch) {
    return null;
  }

  const inner = expressionMatch[1];
  if (!/^[\d+\-*/%\s().]+$/.test(inner)) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${inner})`)();
    return String(result);
  } catch {
    return null;
  }
};

const extractJavascriptPrints = (line: string): string | null => {
  const literalMatch = line.match(/^console\.log\s*\(\s*(["'`])(.*?)\1\s*\)$/);
  if (literalMatch) {
    return literalMatch[2];
  }

  const expressionMatch = line.match(/^console\.log\s*\(\s*(.+?)\s*\)$/);
  if (!expressionMatch) {
    return null;
  }

  const inner = expressionMatch[1];
  if (!/^[\d+\-*/%\s().]+$/.test(inner)) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${inner})`)();
    return String(result);
  } catch {
    return null;
  }
};

const extractCppPrints = (line: string): string | null => {
  const match = line.match(/^std::cout\s*<<\s*(["'])(.*?)\1(?:\s*<<\s*std::endl)?\s*;?$/);
  if (match) {
    return match[2];
  }

  const shortMatch = line.match(/^cout\s*<<\s*(["'])(.*?)\1(?:\s*<<\s*endl)?\s*;?$/);
  if (shortMatch) {
    return shortMatch[2];
  }

  return null;
};

const extractJavaPrints = (line: string): string | null => {
  const match = line.match(/^System\.out\.println\s*\(\s*(["'])(.*?)\1\s*\)\s*;?$/);
  if (match) {
    return match[2];
  }

  return null;
};

const extractGoPrints = (line: string): string | null => {
  const match = line.match(/^fmt\.Println\s*\(\s*(["'])(.*?)\1\s*\)\s*$/);
  if (match) {
    return match[2];
  }

  return null;
};

export const naiveExtractPrints = (code: string, language: SupportedLanguage): string | null => {
  const lines = code.split('\n');
  const outputs: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    let extracted: string | null = null;

    if (language === 'python') {
      extracted = extractPythonPrints(line);
    } else if (language === 'javascript') {
      extracted = extractJavascriptPrints(line);
    } else if (language === 'cpp') {
      extracted = extractCppPrints(line);
    } else if (language === 'java') {
      extracted = extractJavaPrints(line);
    } else if (language === 'go') {
      extracted = extractGoPrints(line);
    }

    if (extracted !== null) {
      outputs.push(extracted);
    }
  }

  return outputs.length > 0 ? outputs.join('\n') : null;
};

export const evaluateSubmission = (
  input: SubmissionEvaluationInput,
): SubmissionEvaluationResult => {
  const referenceSolution = getLanguageCodeFromJson(input.solutionCode, input.language);
  if (!referenceSolution) {
    throw new Error('LANGUAGE_NOT_SUPPORTED');
  }

  const expectedOutput = input.expectedOutput ?? null;
  let userOutput: string | null = null;

  if (expectedOutput) {
    userOutput = naiveExtractPrints(input.code, input.language);
  }

  let isCorrect: boolean;
  if (expectedOutput && userOutput !== null) {
    isCorrect = normalizeOutput(userOutput) === normalizeOutput(expectedOutput);
  } else {
    isCorrect = evaluateCorrectness(input.code, referenceSolution);
  }

  return {
    isCorrect,
    userOutput,
    expectedOutput,
    referenceSolution,
  };
};
