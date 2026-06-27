import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// PERMISSION DEFINITIONS (module.action pattern)
// ============================================================

interface PermissionDef {
  name: string;
  module: string;
  action: string;
  description: string;
}

const ALL_PERMISSIONS: PermissionDef[] = [
  // Landing / Auth
  { name: 'landing.read', module: 'landing', action: 'read', description: 'View landing page' },
  { name: 'auth.login', module: 'auth', action: 'login', description: 'Login to the platform' },
  { name: 'auth.register', module: 'auth', action: 'register', description: 'Register a new account' },

  // Profile
  { name: 'profile.read', module: 'profile', action: 'read', description: 'View own profile' },
  { name: 'profile.update', module: 'profile', action: 'update', description: 'Update own profile' },

  // Dashboard
  { name: 'dashboard.read', module: 'dashboard', action: 'read', description: 'View personal dashboard' },

  // Citizens
  { name: 'citizens.read', module: 'citizens', action: 'read', description: 'View citizen list' },
  { name: 'citizens.create', module: 'citizens', action: 'create', description: 'Create citizen entries' },
  { name: 'citizens.update', module: 'citizens', action: 'update', description: 'Update citizen data' },
  { name: 'citizens.delete', module: 'citizens', action: 'delete', description: 'Delete citizen entries' },

  // Tokens
  { name: 'tokens.read', module: 'tokens', action: 'read', description: 'View token list' },
  { name: 'tokens.create', module: 'tokens', action: 'create', description: 'Generate new tokens' },
  { name: 'tokens.update', module: 'tokens', action: 'update', description: 'Update token status' },
  { name: 'tokens.delete', module: 'tokens', action: 'delete', description: 'Revoke/delete tokens' },

  // Regions
  { name: 'regions.read', module: 'regions', action: 'read', description: 'View regions' },
  { name: 'regions.create', module: 'regions', action: 'create', description: 'Create new regions' },
  { name: 'regions.update', module: 'regions', action: 'update', description: 'Update region data' },
  { name: 'regions.delete', module: 'regions', action: 'delete', description: 'Delete regions' },

  // Merchandise
  { name: 'merchandise.read', module: 'merchandise', action: 'read', description: 'View merchandise' },
  { name: 'merchandise.create', module: 'merchandise', action: 'create', description: 'Create merchandise items' },
  { name: 'merchandise.update', module: 'merchandise', action: 'update', description: 'Update merchandise' },
  { name: 'merchandise.delete', module: 'merchandise', action: 'delete', description: 'Delete merchandise' },

  // Reports
  { name: 'reports.read', module: 'reports', action: 'read', description: 'View reports' },
  { name: 'reports.create', module: 'reports', action: 'create', description: 'Create reports' },
  { name: 'reports.update', module: 'reports', action: 'update', description: 'Update reports' },
  { name: 'reports.delete', module: 'reports', action: 'delete', description: 'Delete reports' },

  // Analytics
  { name: 'analytics.read', module: 'analytics', action: 'read', description: 'View analytics' },

  // Settings
  { name: 'settings.read', module: 'settings', action: 'read', description: 'View system settings' },
  { name: 'settings.update', module: 'settings', action: 'update', description: 'Update system settings' },

  // Audit
  { name: 'audit.read', module: 'audit', action: 'read', description: 'View audit logs' },
  { name: 'audit.create', module: 'audit', action: 'create', description: 'Create audit entries' },

  // Users (admin)
  { name: 'users.read', module: 'users', action: 'read', description: 'View user list' },
  { name: 'users.update', module: 'users', action: 'update', description: 'Update user roles/status' },
  { name: 'users.delete', module: 'users', action: 'delete', description: 'Ban/delete users' },
];

// ============================================================
// ROLE DEFINITIONS with permissions
// ============================================================

interface RoleDef {
  name: string;
  level: number;
  description: string;
  permissionPatterns: string[]; // patterns to match permission names
}

const ROLES: RoleDef[] = [
  {
    name: 'SUPERADMIN',
    level: 100,
    description: 'Full system access - all permissions',
    permissionPatterns: ['*'], // ALL permissions
  },
  {
    name: 'ADMIN',
    level: 80,
    description: 'Administrative access to most modules',
    permissionPatterns: [
      'citizens.*', 'tokens.*', 'regions.*', 'merchandise.*',
      'analytics.read', 'users.read', 'users.update',
    ],
  },
  {
    name: 'MODERATOR',
    level: 60,
    description: 'Content moderation access',
    permissionPatterns: [
      'citizens.read', 'tokens.read', 'regions.read',
      'reports.*',
    ],
  },
  {
    name: 'CITIZEN',
    level: 20,
    description: 'Standard registered user',
    permissionPatterns: [
      'profile.*', 'dashboard.read',
    ],
  },
  {
    name: 'VISITOR',
    level: 0,
    description: 'Unauthenticated visitor',
    permissionPatterns: [
      'landing.read', 'auth.*',
    ],
  },
];

// ============================================================
// HELPER: Check if permission name matches a pattern
// ============================================================

function matchesPattern(permName: string, pattern: string): boolean {
  if (pattern === '*') return true;
  const [mod, action] = pattern.split('.');
  if (action === '*') {
    return permName.startsWith(mod + '.');
  }
  return permName === pattern;
}

function getPermissionsForRole(patterns: string[]): string[] {
  return ALL_PERMISSIONS
    .filter(p => patterns.some(pat => matchesPattern(p.name, pat)))
    .map(p => p.name);
}

// ============================================================
// MAIN SEED
// ============================================================

async function main() {
  console.log('🔧 Seeding RBAC roles and permissions...\n');

  // 1. Create all permissions
  let permCount = 0;
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        name: perm.name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
    permCount++;
  }
  console.log(`✅ ${permCount} permissions created/verified`);

  // 2. Create all roles
  const roleRecords: Record<string, string> = {};
  for (const role of ROLES) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { level: role.level, description: role.description },
      create: {
        name: role.name,
        level: role.level,
        description: role.description,
      },
    });
    roleRecords[role.name] = record.id;
  }
  console.log(`✅ ${ROLES.length} roles created/verified`);

  // 3. Assign permissions to roles
  for (const role of ROLES) {
    const roleId = roleRecords[role.name];
    const permNames = getPermissionsForRole(role.permissionPatterns);

    // Delete existing role permissions first
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    // Fetch permission IDs
    const permissions = await prisma.permission.findMany({
      where: { name: { in: permNames } },
    });

    // Create role-permission mappings
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map(p => ({
          roleId,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
    }

    console.log(`  📋 ${role.name}: ${permissions.length} permissions assigned`);
  }

  // 4. Assign roles to existing users
  const userRoleAssignments: Array<{ username: string; roleName: string }> = [
    { username: 'testuser', roleName: 'CITIZEN' },
    { username: 'john_citizen', roleName: 'CITIZEN' },
    { username: 'testreg123', roleName: 'ADMIN' },
  ];

  for (const assignment of userRoleAssignments) {
    const user = await prisma.user.findUnique({
      where: { username: assignment.username },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: assignment.roleName as any },
      });
      console.log(`  👤 ${assignment.username} → ${assignment.roleName}`);
    } else {
      console.log(`  ⚠️  User ${assignment.username} not found, skipping`);
    }
  }

  console.log('\n🎉 RBAC seed completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ RBAC seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
