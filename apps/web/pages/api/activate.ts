import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getGeoFromIP, getClientIP } from "@/lib/geo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user already has a citizen record
    const existingCitizen = await prisma.citizen.findUnique({
      where: { userId: user.id },
    });

    if (existingCitizen) {
      return res.status(400).json({ error: "User already has a citizen record" });
    }

    // Validate token
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const activationToken = await prisma.token.findUnique({
      where: { code: token },
    });

    if (!activationToken) {
      return res.status(404).json({ error: "Token not found" });
    }

    if (activationToken.status !== "UNUSED") {
      return res.status(400).json({ error: "Token has already been used" });
    }

    // Get IP geolocation
    const ip = getClientIP(req);
    const geoData = await getGeoFromIP(ip);

    // Generate citizen number (LIV-XXXXX format)
    const citizenCount = await prisma.citizen.count();
    const citizenNumber = `LIV-${String(citizenCount + 1).padStart(5, "0")}`;

    // Look up or create region
    let region = await prisma.region.findUnique({
      where: { countryCode: geoData.countryCode },
    });

    if (!region) {
      region = await prisma.region.create({
        data: {
          name: geoData.country,
          countryCode: geoData.countryCode,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        },
      });
    }

    // Create citizen record and update token in a transaction
    const [citizen] = await prisma.$transaction([
      prisma.citizen.create({
        data: {
          userId: user.id,
          citizenNumber,
          regionId: region.id,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          city: geoData.city,
          country: geoData.country,
          countryCode: geoData.countryCode,
          activatedAt: new Date(),
        },
        include: {
          region: true,
        },
      }),
      prisma.token.update({
        where: { code: token },
        data: {
          status: "ACTIVATED",
          activatedBy: user.id,
          activatedAt: new Date(),
        },
      }),
      // Increment region citizen count
      prisma.region.update({
        where: { id: region.id },
        data: {
          citizenCount: { increment: 1 },
        },
      }),
    ]);

    return res.status(200).json({
      citizen: {
        id: citizen.id,
        citizenNumber: citizen.citizenNumber,
        city: citizen.city,
        country: citizen.country,
        countryCode: citizen.countryCode,
        latitude: citizen.latitude,
        longitude: citizen.longitude,
        region: citizen.region,
        activatedAt: citizen.activatedAt,
      },
      message: "Welcome citizen!",
    });
  } catch (error) {
    console.error("Error activating citizen:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}