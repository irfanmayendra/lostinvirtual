import { PrismaClient } from '@prisma/client';

// Prisma 7.x compatibility: Instantiate with direct URL if necessary, 
// though standard env("DATABASE_URL") is still supported via the client constructor config.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
