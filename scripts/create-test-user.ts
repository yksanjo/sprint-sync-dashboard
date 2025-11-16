#!/usr/bin/env tsx
/**
 * Quick script to create a test user directly in the database
 * This bypasses registration and is useful for testing
 * 
 * Usage:
 *   npx tsx scripts/create-test-user.ts
 *   npx tsx scripts/create-test-user.ts test@example.com password123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = process.argv[2] || 'test@example.com';
  const password = process.argv[3] || 'test123456';
  const name = process.argv[4] || 'Test User';

  try {
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log(`⚠️  User ${email} already exists!`);
      console.log(`   User ID: ${existing.id}`);
      console.log(`   Plan: ${existing.plan}`);
      process.exit(0);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        plan: 'FREE',
      },
    });

    console.log('✅ User created successfully!');
    console.log('');
    console.log('📧 Email:', user.email);
    console.log('👤 Name:', user.name);
    console.log('🆔 User ID:', user.id);
    console.log('📦 Plan:', user.plan);
    console.log('');
    console.log('🔑 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    
    if (error.code === 'P1001') {
      console.error('');
      console.error('💡 Database connection failed!');
      console.error('   Make sure DATABASE_URL is set correctly.');
      console.error('   If using Railway, add a PostgreSQL database.');
    } else if (error.message?.includes('table') || error.message?.includes('does not exist')) {
      console.error('');
      console.error('💡 Database tables not found!');
      console.error('   Run migrations: npx prisma migrate deploy');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

