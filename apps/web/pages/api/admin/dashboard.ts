import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLE_LEVELS, auditLog } from "@/lib/rbac";

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

    // Verify role >= ADMIN (80)
    const userLevel = ROLE_LEVELS[user.role as keyof typeof ROLE_LEVELS] ?? 0;
    if (userLevel < 80) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    // Fetch stats
    const [totalCitizens, activeTokens, totalRegions, totalUsers, recentCitizens] = await Promise.all([
      prisma.citizen.count(),
      prisma.token.count({ where: { status: "ACTIVATED" } }),
      prisma.region.count(),
      prisma.user.count(),
      prisma.citizen.findMany({
        take: 5,
        orderBy: { activatedAt: "desc" },
        include: {
          user: { select: { username: true, displayName: true } },
        },
      }),
    ]);

    // Build recent activity
    const recentActivity = recentCitizens.map((c) => ({
      action: "became a citizen",
      user: c.user.displayName || c.user.username,
      time: new Date(c.activatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return res.status(200).json({
      totalCitizens,
      activeTokens,
      totalRegions,
      totalUsers,
      userRole: user.role,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
