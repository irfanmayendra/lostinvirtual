import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCMS() {
  console.log('🌱 Seeding CMS content...');

  // PageContent — Landing page sections
  const pageContents = [
    // Hero section
    { page: 'landing', section: 'hero', key: 'title', value: 'Become a Digital Citizen', type: 'text', order: 0 },
    { page: 'landing', section: 'hero', key: 'subtitle', value: 'Join a global community of digital citizens. Activate your merchandise token, claim your spot on the world map, and represent your region.', type: 'text', order: 1 },
    { page: 'landing', section: 'hero', key: 'ctaText', value: 'Activate Your Token', type: 'text', order: 2 },
    { page: 'landing', section: 'hero', key: 'ctaLink', value: '/signup', type: 'text', order: 3 },

    // Features section
    { page: 'landing', section: 'features', key: 'title', value: 'How It Works', type: 'text', order: 0 },
    { page: 'landing', section: 'features', key: 'subtitle', value: 'Three simple steps to become a digital citizen', type: 'text', order: 1 },
    { page: 'landing', section: 'features', key: 'step1Title', value: 'Get Merchandise', type: 'text', order: 2 },
    { page: 'landing', section: 'features', key: 'step1Desc', value: 'Purchase official LostInVirtual merchandise — t-shirts, hoodies, jackets, or caps. Each comes with a unique activation token.', type: 'text', order: 3 },
    { page: 'landing', section: 'features', key: 'step2Title', value: 'Activate Token', type: 'text', order: 4 },
    { page: 'landing', section: 'features', key: 'step2Desc', value: 'Create your account and enter the scratch code from your merchandise. Your token is unique and can only be used once.', type: 'text', order: 5 },
    { page: 'landing', section: 'features', key: 'step3Title', value: 'Join the Map', type: 'text', order: 6 },
    { page: 'landing', section: 'features', key: 'step3Desc', value: 'Your location is auto-detected and you appear on the world map. Represent your region and connect with citizens worldwide.', type: 'text', order: 7 },

    // Stats section
    { page: 'landing', section: 'stats', key: 'citizensLabel', value: 'Digital Citizens', type: 'text', order: 0 },
    { page: 'landing', section: 'stats', key: 'regionsLabel', value: 'Regions Covered', type: 'text', order: 1 },
    { page: 'landing', section: 'stats', key: 'tokensLabel', value: 'Tokens Activated', type: 'text', order: 2 },

    // CTA section
    { page: 'landing', section: 'cta', key: 'title', value: 'Ready to Join?', type: 'text', order: 0 },
    { page: 'landing', section: 'cta', key: 'subtitle', value: 'Get your merchandise, activate your token, and become part of the global digital citizen network.', type: 'text', order: 1 },
    { page: 'landing', section: 'cta', key: 'buttonText', value: 'Get Started', type: 'text', order: 2 },

    // Login page
    { page: 'login', section: 'hero', key: 'title', value: 'Welcome Back', type: 'text', order: 0 },
    { page: 'login', section: 'hero', key: 'subtitle', value: 'Sign in to access your citizen dashboard', type: 'text', order: 1 },

    // Signup page
    { page: 'signup', section: 'hero', key: 'title', value: 'Join LostInVirtual', type: 'text', order: 0 },
    { page: 'signup', section: 'hero', key: 'subtitle', value: 'Create your account and start your journey as a digital citizen', type: 'text', order: 1 },
  ];

  for (const content of pageContents) {
    await prisma.pageContent.upsert({
      where: { page_section_key: { page: content.page, section: content.section, key: content.key } },
      update: { value: content.value },
      create: content,
    });
  }
  console.log(`  ✅ ${pageContents.length} page content entries`);

  // Announcements
  const announcements = [
    {
      title: 'Welcome to LostInVirtual!',
      content: 'We are live! Activate your merchandise token to become a digital citizen and appear on the world map.',
      type: 'success',
      active: true,
    },
    {
      title: 'New Merchandise Available',
      content: 'Hoodies and jackets are now available in the merchandise store. Each comes with an exclusive activation token.',
      type: 'info',
      active: true,
    },
  ];

  for (const announcement of announcements) {
    await prisma.announcement.create({ data: announcement });
  }
  console.log(`  ✅ ${announcements.length} announcements`);

  // SEO Settings
  const seoSettings = [
    { page: 'home', title: 'LostInVirtual — Digital Citizen Registry', description: 'Join a global community of digital citizens. Activate your merchandise token and appear on the world map.', keywords: 'digital citizen,world map,merchandise,token,activation,community' },
    { page: 'login', title: 'Sign In — LostInVirtual', description: 'Sign in to your LostInVirtual account to manage your digital citizen profile.', keywords: 'login,sign in,account,digital citizen' },
    { page: 'signup', title: 'Join — LostInVirtual', description: 'Create your LostInVirtual account and become a digital citizen.', keywords: 'signup,register,join,digital citizen,create account' },
    { page: 'dashboard', title: 'Dashboard — LostInVirtual', description: 'Manage your digital citizen profile, view your achievements, and track your region.', keywords: 'dashboard,profile,citizen,achievements' },
  ];

  for (const seo of seoSettings) {
    await prisma.seoSetting.upsert({
      where: { page: seo.page },
      update: { title: seo.title, description: seo.description, keywords: seo.keywords },
      create: seo,
    });
  }
  console.log(`  ✅ ${seoSettings.length} SEO settings`);

  // Merchandise catalog
  const merchandise = [
    { name: 'LostInVirtual T-Shirt', type: 'TSHIRT' as const, description: 'Classic black tee with the LostInVirtual logo. Comes with activation token.', price: 29.99 },
    { name: 'LostInVirtual Hoodie', type: 'HOODIE' as const, description: 'Premium hoodie with embroidered logo. Comes with activation token.', price: 59.99 },
    { name: 'LostInVirtual Jacket', type: 'JACKET' as const, description: 'Windbreaker jacket with reflective print. Comes with activation token.', price: 79.99 },
    { name: 'LostInVirtual Cap', type: 'CAP' as const, description: 'Adjustable cap with woven patch. Comes with activation token.', price: 24.99 },
  ];

  for (const item of merchandise) {
    await prisma.merchandise.create({ data: item });
  }
  console.log(`  ✅ ${merchandise.length} merchandise items`);

  console.log('✅ CMS seed complete!');
}

seedCMS()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
