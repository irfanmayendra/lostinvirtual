import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// COUNTRIES & CAPITOLS (lat/lng for world map dots)
// ============================================================

const COUNTRIES: Array<{
  name: string;
  countryCode: string;
  capital: string;
  latitude: number;
  longitude: number;
}> = [
  { name: 'Indonesia', countryCode: 'ID', capital: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },
  { name: 'United States', countryCode: 'US', capital: 'Washington D.C.', latitude: 38.9072, longitude: -77.0369 },
  { name: 'Japan', countryCode: 'JP', capital: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Germany', countryCode: 'DE', capital: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Brazil', countryCode: 'BR', capital: 'Brasília', latitude: -15.7975, longitude: -47.8919 },
  { name: 'Australia', countryCode: 'AU', capital: 'Canberra', latitude: -35.2809, longitude: 149.1300 },
  { name: 'United Kingdom', countryCode: 'GB', capital: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'South Korea', countryCode: 'KR', capital: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
  { name: 'India', countryCode: 'IN', capital: 'New Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'France', countryCode: 'FR', capital: 'Paris', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Canada', countryCode: 'CA', capital: 'Ottawa', latitude: 45.4215, longitude: -75.6972 },
  { name: 'Singapore', countryCode: 'SG', capital: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Netherlands', countryCode: 'NL', capital: 'Amsterdam', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Sweden', countryCode: 'SE', capital: 'Stockholm', latitude: 59.3293, longitude: 18.0686 },
  { name: 'Nigeria', countryCode: 'NG', capital: 'Abuja', latitude: 9.0579, longitude: 7.4951 },
  { name: 'Mexico', countryCode: 'MX', capital: 'Mexico City', latitude: 19.4326, longitude: -99.1332 },
  { name: 'Thailand', countryCode: 'TH', capital: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Turkey', countryCode: 'TR', capital: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'Saudi Arabia', countryCode: 'SA', capital: 'Riyadh', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Argentina', countryCode: 'AR', capital: 'Buenos Aires', latitude: -34.6037, longitude: -58.3816 },
  { name: 'South Africa', countryCode: 'ZA', capital: 'Pretoria', latitude: -25.7479, longitude: 28.2293 },
  { name: 'Philippines', countryCode: 'PH', capital: 'Manila', latitude: 14.5995, longitude: 120.9842 },
  { name: 'Vietnam', countryCode: 'VN', capital: 'Hanoi', latitude: 21.0278, longitude: 105.8342 },
  { name: 'Malaysia', countryCode: 'MY', capital: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869 },
  { name: 'China', countryCode: 'CN', capital: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Russia', countryCode: 'RU', capital: 'Moscow', latitude: 55.7558, longitude: 37.6173 },
  { name: 'Italy', countryCode: 'IT', capital: 'Rome', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Spain', countryCode: 'ES', capital: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Poland', countryCode: 'PL', capital: 'Warsaw', latitude: 52.2297, longitude: 21.0122 },
  { name: 'Egypt', countryCode: 'EG', capital: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
];

// ============================================================
// DUMMY USERS per region (50 fake users spread across countries)
// ============================================================

const DUMMY_USERS: Array<{
  username: string;
  email: string;
  displayName: string;
  countryCode: string;
  city: string;
  bio: string;
}> = [
  // Indonesia (5 users)
  { username: 'budi_santoso', email: 'budi@example.com', displayName: 'Budi Santoso', countryCode: 'ID', city: 'Jakarta', bio: 'Digital citizen from Jakarta' },
  { username: 'sari_dewi', email: 'sari@example.com', displayName: 'Sari Dewi', countryCode: 'ID', city: 'Surabaya', bio: 'Proud Indonesian citizen' },
  { username: 'andi_pratama', email: 'andi@example.com', displayName: 'Andi Pratama', countryCode: 'ID', city: 'Bandung', bio: 'Tech enthusiast' },
  { username: 'maya_putri', email: 'maya@example.com', displayName: 'Maya Putri', countryCode: 'ID', city: 'Bali', bio: 'Island vibes only' },
  { username: 'rio_hermawan', email: 'rio@example.com', displayName: 'Rio Hermawan', countryCode: 'ID', city: 'Yogyakarta', bio: 'Cultural explorer' },
  // USA (4 users)
  { username: 'john_smith', email: 'john@example.com', displayName: 'John Smith', countryCode: 'US', city: 'New York', bio: 'NYC based citizen' },
  { username: 'emily_jones', email: 'emily@example.com', displayName: 'Emily Jones', countryCode: 'US', city: 'San Francisco', bio: 'Bay Area tech lover' },
  { username: 'mike_chen', email: 'mike@example.com', displayName: 'Mike Chen', countryCode: 'US', city: 'Los Angeles', bio: 'LA dreamer' },
  { username: 'sarah_williams', email: 'sarah@example.com', displayName: 'Sarah Williams', countryCode: 'US', city: 'Chicago', bio: 'Midwest roots' },
  // Japan (3 users)
  { username: 'tanaka_yuki', email: 'tanaka@example.com', displayName: 'Tanaka Yuki', countryCode: 'JP', city: 'Tokyo', bio: 'Tokyo nights' },
  { username: 'sato_hiro', email: 'sato@example.com', displayName: 'Sato Hiro', countryCode: 'JP', city: 'Osaka', bio: 'Osaka foodie' },
  { username: 'yamamoto_ken', email: 'yamamoto@example.com', displayName: 'Yamamoto Ken', countryCode: 'JP', city: 'Kyoto', bio: 'Ancient meets modern' },
  // Germany (3 users)
  { username: 'hans_mueller', email: 'hans@example.com', displayName: 'Hans Mueller', countryCode: 'DE', city: 'Berlin', bio: 'Berlin nightlife' },
  { username: 'anna_schmidt', email: 'anna@example.com', displayName: 'Anna Schmidt', countryCode: 'DE', city: 'Munich', bio: 'Bavarian pride' },
  { username: 'lukas_wagner', email: 'lukas@example.com', displayName: 'Lukas Wagner', countryCode: 'DE', city: 'Hamburg', bio: 'Harbor city citizen' },
  // Brazil (3 users)
  { username: 'carlos_silva', email: 'carlos@example.com', displayName: 'Carlos Silva', countryCode: 'BR', city: 'São Paulo', bio: 'Sampa vibes' },
  { username: 'ana_santos', email: 'ana@example.com', displayName: 'Ana Santos', countryCode: 'BR', city: 'Rio de Janeiro', bio: 'Carioca heart' },
  { username: 'pedro_oliveira', email: 'pedro@example.com', displayName: 'Pedro Oliveira', countryCode: 'BR', city: 'Brasília', bio: 'Capital citizen' },
  // UK (3 users)
  { username: 'james_brown', email: 'james@example.com', displayName: 'James Brown', countryCode: 'GB', city: 'London', bio: 'London calling' },
  { username: 'emma_wilson', email: 'emma@example.com', displayName: 'Emma Wilson', countryCode: 'GB', city: 'Manchester', bio: 'Northern soul' },
  { username: 'oliver_taylor', email: 'oliver@example.com', displayName: 'Oliver Taylor', countryCode: 'GB', city: 'Edinburgh', bio: 'Scottish explorer' },
  // Australia (2 users)
  { username: 'jack_wilson', email: 'jack@example.com', displayName: 'Jack Wilson', countryCode: 'AU', city: 'Sydney', bio: 'Sydney harbour view' },
  { username: 'sophie_davis', email: 'sophie@example.com', displayName: 'Sophie Davis', countryCode: 'AU', city: 'Melbourne', bio: 'Coffee culture addict' },
  // South Korea (2 users)
  { username: 'kim_minjun', email: 'kim@example.com', displayName: 'Kim Minjun', countryCode: 'KR', city: 'Seoul', bio: 'K-culture enthusiast' },
  { username: 'park_jiyoon', email: 'park@example.com', displayName: 'Park Jiyoon', countryCode: 'KR', city: 'Busan', bio: 'Beach city vibes' },
  // India (3 users)
  { username: 'rahul_sharma', email: 'rahul@example.com', displayName: 'Rahul Sharma', countryCode: 'IN', city: 'New Delhi', bio: 'Capital citizen' },
  { username: 'priya_patel', email: 'priya@example.com', displayName: 'Priya Patel', countryCode: 'IN', city: 'Mumbai', bio: 'City of dreams' },
  { username: 'arjun_reddy', email: 'arjun@example.com', displayName: 'Arjun Reddy', countryCode: 'IN', city: 'Bangalore', bio: 'Silicon Valley of India' },
  // France (2 users)
  { username: 'pierre_dupont', email: 'pierre@example.com', displayName: 'Pierre Dupont', countryCode: 'FR', city: 'Paris', bio: 'Parisian elegance' },
  { username: 'marie_laurent', email: 'marie@example.com', displayName: 'Marie Laurent', countryCode: 'FR', city: 'Lyon', bio: 'Gastronomy capital' },
  // Canada (2 users)
  { username: 'david_lee', email: 'david@example.com', displayName: 'David Lee', countryCode: 'CA', city: 'Toronto', bio: 'Multicultural hub' },
  { username: 'emma_white', email: 'emma.w@example.com', displayName: 'Emma White', countryCode: 'CA', city: 'Vancouver', bio: 'Pacific Northwest' },
  // Singapore (1 user)
  { username: 'wee_kuan', email: 'wee@example.com', displayName: 'Wee Kuan', countryCode: 'SG', city: 'Singapore', bio: 'Lion city citizen' },
  // Netherlands (1 user)
  { username: 'daan_van_dijk', email: 'daan@example.com', displayName: 'Daan van Dijk', countryCode: 'NL', city: 'Amsterdam', bio: 'Canal city lover' },
  // Sweden (1 user)
  { username: 'erik_lindgren', email: 'erik@example.com', displayName: 'Erik Lindgren', countryCode: 'SE', city: 'Stockholm', bio: 'Nordic design fan' },
  // Nigeria (1 user)
  { username: 'chidi_okafor', email: 'chidi@example.com', displayName: 'Chidi Okafor', countryCode: 'NG', city: 'Lagos', bio: 'Afro-tech pioneer' },
  // Mexico (1 user)
  { username: 'carlos_garcia', email: 'carlos.g@example.com', displayName: 'Carlos Garcia', countryCode: 'MX', city: 'Mexico City', bio: 'Aztec heritage' },
  // Thailand (1 user)
  { username: 'somchai_prasert', email: 'somchai@example.com', displayName: 'Somchai Prasert', countryCode: 'TH', city: 'Bangkok', bio: 'Land of smiles' },
  // Turkey (1 user)
  { username: 'emre_yilmaz', email: 'emre@example.com', displayName: 'Emre Yilmaz', countryCode: 'TR', city: 'Istanbul', bio: 'Bridge between worlds' },
  // Saudi Arabia (1 user)
  { username: 'faisal_alsaud', email: 'faisal@example.com', displayName: 'Faisal AlSaud', countryCode: 'SA', city: 'Riyadh', bio: 'Vision 2030 believer' },
  // Argentina (1 user)
  { username: 'mateo_fernandez', email: 'mateo@example.com', displayName: 'Mateo Fernandez', countryCode: 'AR', city: 'Buenos Aires', bio: 'Tango soul' },
  // South Africa (1 user)
  { username: 'thabo_molefe', email: 'thabo@example.com', displayName: 'Thabo Molefe', countryCode: 'ZA', city: 'Cape Town', bio: 'Rainbow nation' },
  // Philippines (1 user)
  { username: 'maria_santos', email: 'maria@example.com', displayName: 'Maria Santos', countryCode: 'PH', city: 'Manila', bio: 'Pinay proud' },
  // Vietnam (1 user)
  { username: 'nguyen_van_a', email: 'nguyen@example.com', displayName: 'Nguyen Van A', countryCode: 'VN', city: 'Hanoi', bio: 'Heritage keeper' },
  // Malaysia (1 user)
  { username: 'ahmad_firdaus', email: 'ahmad@example.com', displayName: 'Ahmad Firdaus', countryCode: 'MY', city: 'Kuala Lumpur', bio: 'KL citizen' },
  // China (1 user)
  { username: 'wang_wei', email: 'wang@example.com', displayName: 'Wang Wei', countryCode: 'CN', city: 'Beijing', bio: 'Great Wall guardian' },
  // Russia (1 user)
  { username: 'dmitri_volkov', email: 'dmitri@example.com', displayName: 'Dmitri Volkov', countryCode: 'RU', city: 'Moscow', bio: 'Red Square citizen' },
  // Italy (1 user)
  { username: 'luca_rossi', email: 'luca@example.com', displayName: 'Luca Rossi', countryCode: 'IT', city: 'Rome', bio: 'Eternal city resident' },
  // Spain (1 user)
  { username: 'pablo_martinez', email: 'pablo@example.com', displayName: 'Pablo Martinez', countryCode: 'ES', city: 'Madrid', bio: 'Hola mundo' },
  // Poland (1 user)
  { username: 'piotr_nowak', email: 'piotr@example.com', displayName: 'Piotr Nowak', countryCode: 'PL', city: 'Warsaw', bio: 'Rising star' },
  // Egypt (1 user)
  { username: 'ahmed_hassan', email: 'ahmed@example.com', displayName: 'Ahmed Hassan', countryCode: 'EG', city: 'Cairo', bio: 'Pharaoh heritage' },
];

// ============================================================
// TOKENS (one per dummy user)
// ============================================================

function generateTokenCode(index: number): string {
  const prefix = 'LIV';
  const num = String(index + 1).padStart(4, '0');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${num}-${suffix}`;
}

const MERCHANDISE_TYPES: Array<'TSHIRT' | 'HOODIE' | 'JACKET' | 'CAP'> = [
  'TSHIRT', 'HOODIE', 'JACKET', 'CAP',
];

// ============================================================
// MAIN SEED
// ============================================================

async function main() {
  console.log('🌱 Seeding database with dummy data...\n');

  // --------------------------------------------------------
  // 1. ACHIEVEMENTS
  // --------------------------------------------------------
  const achievementCount = await prisma.achievement.count();
  if (achievementCount === 0) {
    await prisma.achievement.createMany({
      data: [
        { name: 'First Activation', description: 'Activated your first merchandise token', icon: '🎉', category: 'activation', points: 10 },
        { name: 'Globe Trotter', description: 'Citizen from 3+ different regions', icon: '🌍', category: 'exploration', points: 25 },
        { name: 'Early Adopter', description: 'One of the first 100 citizens', icon: '⚡', category: 'milestone', points: 50 },
        { name: 'Social Butterfly', description: 'Connected 3+ social accounts', icon: '🦋', category: 'social', points: 15 },
        { name: 'Collector', description: 'Activated 3+ merchandise items', icon: '👕', category: 'collection', points: 30 },
      ],
    });
    console.log('✅ 5 achievements seeded');
  }

  // --------------------------------------------------------
  // 2. REGIONS (countries with lat/lng for world map)
  // --------------------------------------------------------
  let regionCount = 0;
  for (const country of COUNTRIES) {
    const existing = await prisma.region.findUnique({ where: { countryCode: country.countryCode } });
    if (!existing) {
      await prisma.region.create({
        data: {
          name: country.name,
          countryCode: country.countryCode,
          latitude: country.latitude,
          longitude: country.longitude,
          citizenCount: 0,
        },
      });
      regionCount++;
    }
  }
  console.log(`✅ ${regionCount} regions seeded`);

  // --------------------------------------------------------
  // 3. DUMMY USERS + CITUZENS + TOKENS
  // --------------------------------------------------------
  let userCount = 0;
  let tokenCount = 0;
  let citizenCount = 0;

  for (let i = 0; i < DUMMY_USERS.length; i++) {
    const userData = DUMMY_USERS[i];
    const country = COUNTRIES.find(c => c.countryCode === userData.countryCode);
    if (!country) continue;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { username: userData.username } });
    if (existingUser) continue;

    // Create user (with fake keycloakId)
    const user = await prisma.user.create({
      data: {
        keycloakId: `dummy-${userData.username}-${Date.now()}`,
        username: userData.username,
        email: userData.email,
        displayName: userData.displayName,
        role: 'CITIZEN',
        lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // random within last 30 days
      },
    });
    userCount++;

    // Create citizen
    const citizenNumber = `LIV-${String(citizenCount + 1).padStart(5, '0')}`;
    const citizen = await prisma.citizen.create({
      data: {
        userId: user.id,
        citizenNumber,
        regionId: (await prisma.region.findUnique({ where: { countryCode: userData.countryCode } }))?.id || '',
        latitude: country.latitude + (Math.random() - 0.5) * 0.5,
        longitude: country.longitude + (Math.random() - 0.5) * 0.5,
        city: userData.city,
        country: country.name,
        countryCode: userData.countryCode,
        bio: userData.bio,
        activatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    citizenCount++;

    // Create token (used by this user)
    const tokenCode = generateTokenCode(i);
    await prisma.token.create({
      data: {
        code: tokenCode,
        merchandiseType: MERCHANDISE_TYPES[i % MERCHANDISE_TYPES.length],
        batchNumber: `batch-${String(Math.floor(i / 10) + 1).padStart(3, '0')}`,
        status: 'ACTIVATED',
        activatedBy: user.id,
        activatedAt: citizen.activatedAt,
      },
    });
    tokenCount++;

    // Update region citizen count
    await prisma.region.update({
      where: { countryCode: userData.countryCode },
      data: { citizenCount: { increment: 1 } },
    });
  }

  // --------------------------------------------------------
  // 4. EXTRA UNUSED TOKENS (for testing activation flow)
  // --------------------------------------------------------
  const extraTokens = [];
  for (let i = 0; i < 20; i++) {
    extraTokens.push({
      code: generateTokenCode(DUMMY_USERS.length + i),
      merchandiseType: MERCHANDISE_TYPES[i % MERCHANDISE_TYPES.length],
      batchNumber: `batch-${String(Math.floor((DUMMY_USERS.length + i) / 10) + 1).padStart(3, '0')}`,
      status: 'UNUSED' as const,
    });
  }
  const existingTokens = await prisma.token.count();
  if (existingTokens < DUMMY_USERS.length + 20) {
    await prisma.token.createMany({ data: extraTokens, skipDuplicates: true });
    tokenCount += extraTokens.length;
  }

  console.log(`✅ ${userCount} dummy users created`);
  console.log(`✅ ${citizenCount} citizens activated`);
  console.log(`✅ ${tokenCount} tokens (${DUMMY_USERS.length} used + ${extraTokens.length} unused)`);
  console.log(`\n🎉 Database seeded! ${citizenCount} citizens across ${COUNTRIES.length} countries\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
