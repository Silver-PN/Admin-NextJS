import { PrismaClient, Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

let prisma: PrismaClient;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
  prisma = global.prismaGlobal;
}

// Prisma middleware to automatically generate an ID during creation
prisma.$use(
  async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    if (params.action === 'create' && params.model === 'User') {
      // Check if the ID is not provided and generate a new one
      if (!params.args.data.id) {
        params.args.data.id = createId();
      }
    }
    return next(params);
  }
);

export default prisma;
