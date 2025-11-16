import { PrismaClient } from '@prisma/client';

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('');
  console.error('To fix this:');
  console.error('1. Go to Railway → Your Project');
  console.error('2. Click "+ New" → "Database" → "Add PostgreSQL"');
  console.error('3. Railway will automatically set DATABASE_URL');
  console.error('4. Redeploy your service');
  console.error('');
  // Don't exit - let the app start so the error endpoint can be accessed
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection on startup
if (process.env.DATABASE_URL) {
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error);
      console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
      // Don't exit - let the app start and handle errors gracefully
    });
} else {
  console.warn('⚠️  Skipping database connection test - DATABASE_URL not set');
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

