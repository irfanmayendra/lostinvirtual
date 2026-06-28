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

    // GET - List merchandise
    if (req.method === "GET") {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 15);
      const skip = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const type = (req.query.type as string) || "";
      const active = req.query.active as string;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }
      if (type && type !== "ALL") {
        where.type = type;
      }
      if (active === "true") {
        where.active = true;
      } else if (active === "false") {
        where.active = false;
      }

      const [merchandise, total] = await Promise.all([
        prisma.merchandise.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.merchandise.count({ where }),
      ]);

      return res.status(200).json({ data: merchandise, total, page, limit });
    }

    // POST - Create merchandise
    if (req.method === "POST") {
      const { name, type, description, price, imageUrl } = req.body;

      if (!name || !type || price === undefined) {
        return res.status(400).json({ error: "name, type, and price are required" });
      }

      const validTypes = ["TSHIRT", "HOODIE", "JACKET", "CAP"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid merchandise type" });
      }

      const merchandise = await prisma.merchandise.create({
        data: {
          name,
          type,
          description: description || "",
          price: parseFloat(price),
          imageUrl: imageUrl || "",
          active: true,
        },
      });

      await auditLog({
        userId: adminUser.id,
        action: "merchandise.create",
        entity: "merchandise",
        entityId: merchandise.id,
        details: { name, type, price },
      });

      return res.status(201).json({ merchandise });
    }

    // PATCH - Update merchandise
    if (req.method === "PATCH") {
      const { id, name, type, description, price, imageUrl, active } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (type !== undefined) {
        const validTypes = ["TSHIRT", "HOODIE", "JACKET", "CAP"];
        if (!validTypes.includes(type)) {
          return res.status(400).json({ error: "Invalid merchandise type" });
        }
        data.type = type;
      }
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = parseFloat(price);
      if (imageUrl !== undefined) data.imageUrl = imageUrl;
      if (active !== undefined) data.active = Boolean(active);

      const merchandise = await prisma.merchandise.update({
        where: { id },
        data,
      });

      await auditLog({
        userId: adminUser.id,
        action: "merchandise.update",
        entity: "merchandise",
        entityId: id,
        details: data,
      });

      return res.status(200).json({ merchandise });
    }

    // DELETE - Delete merchandise
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "id is required" });
      }

      await prisma.merchandise.delete({ where: { id } });

      await auditLog({
        userId: adminUser.id,
        action: "merchandise.delete",
        entity: "merchandise",
        entityId: id,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Merchandise API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
