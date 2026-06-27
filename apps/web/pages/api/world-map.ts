import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get all regions with citizen counts
    const regions = await prisma.region.findMany({
      select: {
        name: true,
        countryCode: true,
        latitude: true,
        longitude: true,
        citizenCount: true,
      },
      orderBy: {
        citizenCount: "desc",
      },
    });

    // Get total counts
    const [totalCitizens, totalRegions] = await Promise.all([
      prisma.citizen.count(),
      prisma.region.count(),
    ]);

    return res.status(200).json({
      regions,
      totalCitizens,
      totalRegions,
    });
  } catch (error) {
    console.error("Error fetching world map data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}