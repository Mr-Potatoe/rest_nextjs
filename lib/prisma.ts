// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({
//   log: ["query", "info", "warn", "error"], // Logs queries for debugging
// });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient; requestCount?: number };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query", "info", "warn", "error"], // Logs queries for debugging
});

// Initialize request counter
if (!globalForPrisma.requestCount) {
  globalForPrisma.requestCount = 0;

  // Reset request count every 24 hours
  setInterval(() => {
    globalForPrisma.requestCount = 0;
  }, 24 * 60 * 60 * 1000);
}

export const incrementRequestCount = () => {
  if (globalForPrisma.requestCount !== undefined) {
    globalForPrisma.requestCount++;
  }
};

export const getRequestCount = () => globalForPrisma.requestCount || 0;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
