import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ROLE_LEVELS, auditLog } from "@/lib/rbac";

function generateTokenCode(index: number): string {
  const prefix = "LIV";
  const num = String(index + 1).padStart(4, "0");
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${num}-${suffix}`;
}

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

    // GET - List tokens
    if (req.method === "GET") {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 15);
      const skip = (page - 1) * limit;
      const status = (req.query.status as string) || "";
      const type = (req.query.type as string) || "";

      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }
      if (type && type !== "ALL") {
        where.merchandiseType = type;
      }

      const [tokens, total] = await Promise.all([
        prisma.token.findMany({
          where,
          include: {
            user: { select: { username: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.token.count({ where }),
      ]);

      return res.status(200).json({ tokens, total, page, limit });
    }

    // POST - Generate new token batch
    if (req.method === "POST") {
      const { count = 10, merchandiseType = "TSHIRT" } = req.body;

      const validTypes = ["TSHIRT", "HOODIE", "JACKET", "CAP"];
      if (!validTypes.includes(merchandiseType)) {
        return res.status(400).json({ error: "Invalid merchandise type" });
      }

      const batchNum = String(Date.now()).slice(-6);
      const batchNumber = `batch-${batchNum}`;

      // Get existing token count for numbering
      const existingCount = await prisma.token.count();

      const tokens = [];
      for (let i = 0; i < Math.min(count, 100); i++) {
        tokens.push({
          code: generateTokenCode(existingCount + i),
          merchandiseType: merchandiseType as any,
          batchNumber,
          status: "UNUSED" as const,
        });
      }

      await prisma.token.createMany({ data: tokens });

      await auditLog({
        userId: adminUser.id,
        action: "token.generate",
        entity: "token",
        details: { count: tokens.length, merchandiseType, batchNumber },
      });

      return res.status(201).json({
        success: true,
        generated: tokens.length,
        batchNumber,
      });
    }

    // PATCH - Revoke token
    if (req.method === "PATCH") {
      const { tokenId, status } = req.body;

      if (!tokenId || !status) {
        return res.status(400).json({ error: "tokenId and status are required" });
      }

      const validStatuses = ["UNUSED", "ACTIVATED", "SUSPENDED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await prisma.token.update({
        where: { id: tokenId },
        data: { status: status as any },
      });

      await auditLog({
        userId: adminUser.id,
        action: `token.${status.toLowerCase()}`,
        entity: "token",
        entityId: tokenId,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Tokens API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
