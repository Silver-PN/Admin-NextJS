import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });
} else {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      log: ['query', 'info', 'warn', 'error']
    });
    //   global.prismaGlobal.$on('query', (e) => {
    //     console.log(`Query: ${e.query}`);
    //     console.log(`Params: ${e.params}`);
    //     console.log(`Duration: ${e.duration}ms`);
    //   });
  }
  prisma = global.prismaGlobal;
}

export default prisma;
