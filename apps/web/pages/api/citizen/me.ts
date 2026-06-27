import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const citizen = await prisma.citizen.findUnique({
      where: { userId: user.id },
      include: {
        region: true,
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!citizen) {
      return res.status(200).json({ citizen: null });
    }

    return res.status(200).json({
      citizen: {
        id: citizen.id,
        citizenNumber: citizen.citizenNumber,
        city: citizen.city,
        country: citizen.country,
        countryCode: citizen.countryCode,
        latitude: citizen.latitude,
        longitude: citizen.longitude,
        bio: citizen.bio,
        socialLinks: citizen.socialLinks,
        region: citizen.region,
        regionName: citizen.region?.name || null,
        achievements: citizen.achievements.map((ca) => ({
          id: ca.achievement.id,
          name: ca.achievement.name,
          description: ca.achievement.description,
          icon: ca.achievement.icon,
          category: ca.achievement.category,
          points: ca.achievement.points,
          earnedAt: ca.earnedAt,
        })),
        activatedAt: citizen.activatedAt,
        createdAt: citizen.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching citizen profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
