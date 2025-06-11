// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// Ensure that 'var' is used for the global declaration for compatibility with Next.js HMR
// and to specifically match the common pattern for Prisma client instantiation in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      // Optional: Log Prisma queries in development
      // log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

export default prisma;
