import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

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
    client.$disconnect().catch(() => undefined);
    throw new Error(`Failed to connect to database: ${String(error)}`);
  }
};

export const disconnectDatabase = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
};
