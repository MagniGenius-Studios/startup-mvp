import { config } from 'dotenv';
import { z } from 'zod';

// Loads and validates all required runtime environment variables once at startup.
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET should be at least 16 characters'),
  GROQ_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
  JSON_BODY_LIMIT: z.string().default('1mb'),
  HTTP_LOG_FORMAT: z.string().default('combined'),
  AUTH_COOKIE_MAX_AGE_MS: z.coerce.number().int().positive().default(24 * 60 * 60 * 1000),
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast so invalid env never reaches runtime request handling.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && !parsed.data.FRONTEND_URL) {
  console.error('Invalid environment configuration:', {
    FRONTEND_URL: ['FRONTEND_URL is required when NODE_ENV=production'],
  });
  process.exit(1);
}

const frontendUrl = (parsed.data.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  groqApiKey: parsed.data.GROQ_API_KEY,
  frontendUrl,
  jsonBodyLimit: parsed.data.JSON_BODY_LIMIT,
  httpLogFormat: parsed.data.HTTP_LOG_FORMAT,
  authCookieMaxAgeMs: parsed.data.AUTH_COOKIE_MAX_AGE_MS,
  oauthGoogleClientId: parsed.data.OAUTH_GOOGLE_CLIENT_ID,
  oauthGoogleClientSecret: parsed.data.OAUTH_GOOGLE_CLIENT_SECRET,
  emailProviderApiKey: parsed.data.EMAIL_PROVIDER_API_KEY,
};
