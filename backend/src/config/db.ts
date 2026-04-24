import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

// Reuse a singleton Prisma client to avoid exhausting DB connections.
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  return prisma;
};

export const connectDatabase = async () => {
  const client = getPrismaClient();
  try {
    await client.$connect();
    return client;
  } catch (error) {
    // Clean up half-open client when initial connection fails.
    client.$disconnect().catch(() => undefined);
    throw new Error(`Failed to connect to database: ${String(error)}`);
  }
};

// Closes singleton client during graceful shutdown.
export const disconnectDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
};
