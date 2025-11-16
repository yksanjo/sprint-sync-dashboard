import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is set and not a dummy value
const isDummyDatabase = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy:dummy@dummy');

if (isDummyDatabase) {
  console.error('');
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('');
  console.error('📝 To fix this:');
  console.error('   1. Go to Railway → Your Project');
  console.error('   2. Click "+ New" → "Database" → "Add PostgreSQL"');
  console.error('   3. Railway will automatically set DATABASE_URL');
  console.error('   4. Redeploy your service');
  console.error('');
  console.error('⚠️  Server will start, but database features will not work.');
  console.error('');
}

// Create Prisma client with error handling
// Prisma will validate DATABASE_URL at initialization, so we need to catch errors
let prisma: PrismaClient;

try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Only test connection if DATABASE_URL is set and not dummy
  if (!isDummyDatabase) {
    prisma.$connect()
      .then(() => {
        console.log('✅ Database connected successfully');
      })
      .catch((error) => {
        console.error('❌ Database connection failed:', error);
        console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        // Don't exit - let the app start and handle errors gracefully
      });
  }
} catch (error: any) {
  // If Prisma initialization fails (e.g., missing DATABASE_URL), create a stub
  console.error('⚠️  Prisma client initialization failed:', error?.message);
  console.error('⚠️  Database features will not work until DATABASE_URL is set.');
  
  // Create a minimal stub that will throw helpful errors when used
  prisma = {
    $connect: async () => { throw new Error('DATABASE_URL not set'); },
    $disconnect: async () => {},
    $queryRaw: async () => { throw new Error('DATABASE_URL not set'); },
    user: {
      findUnique: async () => { throw new Error('DATABASE_URL not set'); },
      create: async () => { throw new Error('DATABASE_URL not set'); },
      count: async () => { throw new Error('DATABASE_URL not set'); },
    } as any,
  } as any;
}

export default prisma;

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

