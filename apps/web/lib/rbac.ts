import prisma from "./prisma";

// Role hierarchy levels
export const ROLE_LEVELS = {
  VISITOR: 0,
  CITIZEN: 20,
  MODERATOR: 60,
  ADMIN: 80,
  SUPERADMIN: 100,
} as const;

export type RoleName = keyof typeof ROLE_LEVELS;

/**
 * Check if user has minimum role level
 */
export async function hasRole(userId: string, minLevel: number): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  const userLevel = ROLE_LEVELS[user.role as RoleName] ?? 0;
  return userLevel >= minLevel;
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  // Superadmins have all permissions
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true;
  
  // Check user-specific permissions
  const userPerm = await prisma.userPermission.findFirst({
    where: { userId, permission: { name: permissionName } },
  });
  if (userPerm) return true;
  
  // Check role-based permissions
  const rolePerm = await prisma.rolePermission.findFirst({
    where: {
      role: { users: { some: { id: userId } } },
      permission: { name: permissionName },
    },
  });
  return !!rolePerm;
}

/**
 * Get all permissions for a user (role + user-specific)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];
  if (user.role === 'SUPERADMIN') {
    const all = await prisma.permission.findMany();
    return all.map(p => p.name);
  }
  
  const perms = await prisma.permission.findMany({
    where: {
      OR: [
        // Role-based permissions
        { roles: { some: { role: { users: { some: { id: userId } } } } } },
        // Direct user permissions
        { users: { some: { user: { id: userId } } } },
      ],
    },
  });
  return perms.map(p => p.name);
}

/**
 * Require minimum role level - throws if not met
 */
export async function requireRole(userId: string, minLevel: number): Promise<void> {
  const ok = await hasRole(userId, minLevel);
  if (!ok) throw new Error(`Insufficient permissions: requires level ${minLevel}`);
}

/**
 * Require specific permission - throws if not met
 */
export async function requirePermission(userId: string, permissionName: string): Promise<void> {
  const ok = await hasPermission(userId, permissionName);
  if (!ok) throw new Error(`Missing permission: ${permissionName}`);
}

/**
 * Log an audit event
 */
export async function auditLog(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data: params });
}
