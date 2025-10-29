import { PrismaClient } from '@prisma/client';

// Prisma client singleton for serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Prisma with pooled connection (pgbouncer mode to avoid prepared statement conflicts)
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL || '';
  // Add pgbouncer=true to disable prepared statements in serverless
  if (baseUrl.includes('?')) {
    return baseUrl.includes('pgbouncer=true') ? baseUrl : `${baseUrl}&pgbouncer=true`;
  }
  return `${baseUrl}?pgbouncer=true`;
};

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to retry database operations with fresh client on prepared statement errors
export async function retryWithFreshClient<T>(
  operation: (client: PrismaClient) => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    // First try with the main client
    return await operation(prisma);
  } catch (error) {
    // If it's a prepared statement error, retry with fresh client
    if (error instanceof Error && error.message.includes('prepared statement')) {
      console.log(`⚠️ Prepared statement conflict in ${operationName}, retrying with fresh client...`);
      
      const freshClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        }
      });
      
      try {
        const result = await operation(freshClient);
        console.log(`✅ ${operationName} succeeded with fresh client`);
        return result;
      } finally {
        await freshClient.$disconnect();
      }
    }
    // Re-throw non-prepared-statement errors
    throw error;
  }
}

export default prisma;
