import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const regions = await prisma.region.findMany({
      orderBy: { citizenCount: "desc" },
    });

    return res.status(200).json({ regions });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
