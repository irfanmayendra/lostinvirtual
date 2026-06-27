import type { NextApiRequest } from "next";

export interface GeoData {
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

const DEFAULT_GEO: GeoData = {
  city: "Unknown",
  country: "Unknown",
  countryCode: "XX",
  latitude: 0,
  longitude: 0,
};

/**
 * Get geolocation data from IP address using ip-api.com
 * Falls back to defaults for localhost/private IPs
 */
export async function getGeoFromIP(ip: string): Promise<GeoData> {
  // Handle localhost and private IPs
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  ) {
    return DEFAULT_GEO;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=66846721`
    );
    const data = await response.json();

    if (data.status === "success") {
      return {
        city: data.city || "Unknown",
        country: data.country || "Unknown",
        countryCode: data.countryCode || "XX",
        latitude: data.lat || 0,
        longitude: data.lon || 0,
      };
    }

    return DEFAULT_GEO;
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return DEFAULT_GEO;
  }
}

/**
 * Extract real client IP from request
 * Checks x-forwarded-for header first, then falls back to socket address
 */
export function getClientIP(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs; take the first one
    const ip = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(",")[0];
    return ip.trim();
  }

  return req.socket.remoteAddress || "127.0.0.1";
}