import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLE_LEVELS, auditLog } from "@/lib/rbac";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get admin user from DB
    const adminUser = await prisma.user.findFirst({
      where: { email: session.user.email || "" },
    });
    if (!adminUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify role >= ADMIN (80)
    const adminLevel = ROLE_LEVELS[adminUser.role as keyof typeof ROLE_LEVELS] ?? 0;
    if (adminLevel < 80) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // GET - List users
    if (req.method === "GET") {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 15);
      const skip = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const role = (req.query.role as string) || "";

      const where: any = {};
      if (search) {
        where.OR = [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ];
      }
      if (role) {
        where.role = role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            lastLoginAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return res.status(200).json({ users, total, page, limit });
    }

    // PATCH - Update user role
    if (req.method === "PATCH") {
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: "userId and role are required" });
      }

      const validRoles = ["SUPERADMIN", "ADMIN", "MODERATOR", "CITIZEN", "VISITOR"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      // Prevent self-demotion below admin
      if (userId === adminUser.id && ROLE_LEVELS[role as keyof typeof ROLE_LEVELS] < 80) {
        return res.status(400).json({ error: "Cannot demote yourself below ADMIN" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any },
        select: { id: true, username: true, role: true },
      });

      // Audit log
      await auditLog({
        userId: adminUser.id,
        action: "user.role_change",
        entity: "user",
        entityId: userId,
        details: { newRole: role },
      });

      return res.status(200).json({ user: updatedUser });
    }

    // DELETE - Soft ban
    if (req.method === "DELETE") {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Prevent self-ban
      if (userId === adminUser.id) {
        return res.status(400).json({ error: "Cannot ban yourself" });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { role: "VISITOR" as any },
      });

      await auditLog({
        userId: adminUser.id,
        action: "user.ban",
        entity: "user",
        entityId: userId,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Users API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
