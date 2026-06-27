import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const tokens = await prisma.token.findMany({
      include: {
        user: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
