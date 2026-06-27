import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLE_LEVELS } from "@/lib/rbac";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user from DB
    const user = await prisma.user.findFirst({
      where: { email: session.user.email || "" },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify role >= ADMIN (80) for reading, SUPERADMIN (100) for full access
    const userLevel = ROLE_LEVELS[user.role as keyof typeof ROLE_LEVELS] ?? 0;
    if (userLevel < 80) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Parse query params
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
    const skip = (page - 1) * limit;
    const action = (req.query.action as string) || "";
    const entity = (req.query.entity as string) || "";

    const where: any = {};
    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }
    if (entity) {
      where.entity = entity;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { username: true, email: true, displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.status(200).json({ logs, total, page, limit });
  } catch (error) {
    console.error("Audit API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
