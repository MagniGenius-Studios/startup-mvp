import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z
    .string()
    .optional()
    .transform((value) => {
      const parsed = Number(value ?? "4000");
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("PORT must be a positive integer");
      }
      return parsed;
    }),
  DATABASE_URL: z.string().url().optional(),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
});

export const env = envSchema.parse(process.env);
