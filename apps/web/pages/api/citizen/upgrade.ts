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

    // Check if user has a citizen record
    const existingCitizen = await prisma.citizen.findUnique({
      where: { userId: user.id },
    });

    if (!existingCitizen) {
      return res.status(400).json({ error: "User does not have a citizen record. Please activate first." });
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

    // Update citizen's region and mark token as used in a transaction
    const [updatedCitizen] = await prisma.$transaction([
      prisma.citizen.update({
        where: { userId: user.id },
        data: {
          regionId: region.id,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          city: geoData.city,
          country: geoData.country,
          countryCode: geoData.countryCode,
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
      // Update region citizen counts if region changed
      ...(existingCitizen.regionId !== region.id
        ? [
            // Decrement old region count
            ...(existingCitizen.regionId
              ? [
                  prisma.region.update({
                    where: { id: existingCitizen.regionId },
                    data: { citizenCount: { decrement: 1 } },
                  }),
                ]
              : []),
            // Increment new region count
            prisma.region.update({
              where: { id: region.id },
              data: { citizenCount: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return res.status(200).json({
      citizen: {
        id: updatedCitizen.id,
        citizenNumber: updatedCitizen.citizenNumber,
        city: updatedCitizen.city,
        country: updatedCitizen.country,
        countryCode: updatedCitizen.countryCode,
        latitude: updatedCitizen.latitude,
        longitude: updatedCitizen.longitude,
        region: updatedCitizen.region,
      },
      message: "Region updated successfully!",
    });
  } catch (error) {
    console.error("Error upgrading citizen:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}