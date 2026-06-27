import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================================
  // ACHIEVEMENTS
  // ============================================================
  await prisma.achievement.createMany({
    data: [
      { name: 'First Activation', description: 'Activated your first merchandise token', icon: '🎉', category: 'activation', points: 10 },
      { name: 'Globe Trotter', description: 'Citizen from 3+ different regions', icon: '🌍', category: 'exploration', points: 25 },
      { name: 'Early Adopter', description: 'One of the first 100 citizens', icon: '⚡', category: 'milestone', points: 50 },
      { name: 'Social Butterfly', description: 'Connected 3+ social accounts', icon: '🦋', category: 'social', points: 15 },
      { name: 'Collector', description: 'Activated 3+ merchandise items', icon: '👕', category: 'collection', points: 30 },
    ],
  });

  console.log('✅ Achievements seeded');

  // ============================================================
  // TEST TOKENS
  // ============================================================
  await prisma.token.createMany({
    data: [
      { code: 'LIV-TEST-0001', merchandiseType: 'TSHIRT', batchNumber: 'batch-001' },
      { code: 'LIV-TEST-0002', merchandiseType: 'HOODIE', batchNumber: 'batch-001' },
      { code: 'LIV-TEST-0003', merchandiseType: 'JACKET', batchNumber: 'batch-001' },
      { code: 'LIV-TEST-0004', merchandiseType: 'CAP', batchNumber: 'batch-001' },
      { code: 'LIV-TEST-0005', merchandiseType: 'TSHIRT', batchNumber: 'batch-002' },
    ],
  });

  console.log('✅ Test tokens seeded');

  console.log('\n🎉 Database seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
