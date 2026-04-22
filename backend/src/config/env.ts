import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET should be at least 16 characters'),
  GROQ_API_KEY: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  port: parseInt(parsed.data.PORT, 10),
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  groqApiKey: parsed.data.GROQ_API_KEY,
  oauthGoogleClientId: parsed.data.OAUTH_GOOGLE_CLIENT_ID,
  oauthGoogleClientSecret: parsed.data.OAUTH_GOOGLE_CLIENT_SECRET,
  emailProviderApiKey: parsed.data.EMAIL_PROVIDER_API_KEY,
};
