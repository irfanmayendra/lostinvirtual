import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const citizens = await prisma.citizen.findMany({
      include: {
        user: { select: { id: true, username: true, email: true, displayName: true } },
        region: { select: { name: true, countryCode: true } },
      },
      orderBy: { activatedAt: "desc" },
    });

    return res.status(200).json({ citizens });
  } catch (error) {
    console.error("Error fetching citizens:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
