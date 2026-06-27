import React, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import WorldMapPreview from "@/components/WorldMapPreview";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Region {
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  citizenCount: number;
}

interface WorldMapData {
  regions: Region[];
  totalCitizens: number;
  totalRegions: number;
}

/* ------------------------------------------------------------------ */
/* Animated counter hook                                               */
/* ------------------------------------------------------------------ */

function useCountUp(end: number, duration = 1800, active = true) {
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!active || end === 0) {
      setValue(end);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    };
    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration, active]);

  return value;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [worldData, setWorldData] = useState<WorldMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);

  /* ---- redirect if authenticated ---- */
  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  /* ---- fetch world data ---- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/world-map");
        if (res.ok) setWorldData(await res.json());
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---- fade-in map on scroll ---- */
  useEffect(() => {
    const timer = setTimeout(() => setMapVisible(true), 600);
    return () => clearTimeout(timer);
  }, []);

  /* ---- animated counters ---- */
  const citizenCount = useCountUp(worldData?.totalCitizens ?? 0, 2000, !loading);
  const regionCount = useCountUp(worldData?.totalRegions ?? 0, 2000, !loading);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Head>
        <title>LostInVirtual — Digital Citizen Registry</title>
        <meta
          name="description"
          content="The digital frontier's premier citizen registry. Claim your identity, secure your status, and become part of the ecosystem."
        />
      </Head>

      {/* ============================================================ */}
      {/* HERO                                                          */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-gradient grid-bg">
        {/* Subtle decorative orbs */}
        <div
          className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]
                     bg-gradient-to-br from-blue-500 to-purple-600 blur-[120px] pointer-events-none"
          aria-hidden
        />

        <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto px-6 py-20">
          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-none">
            <span className="gradient-text">LostInVirtual</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The digital frontier&apos;s premier citizen registry.
            <br className="hidden sm:block" /> Claim your identity, secure your
            status, and become part of the ecosystem.
          </p>

          {/* Animated stats bar */}
          <div className="flex justify-center gap-10 sm:gap-16 pt-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold tabular-nums text-blue-400">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-800 rounded animate-pulse" />
                ) : (
                  citizenCount.toLocaleString()
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                Citizens
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold tabular-nums text-purple-400">
                {loading ? (
                  <span className="inline-block w-16 h-8 bg-gray-800 rounded animate-pulse" />
                ) : (
                  regionCount.toLocaleString()
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-wider">
                Regions
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {status === "loading" ? (
              <div className="h-14 w-56 rounded-xl bg-gray-800 animate-pulse" />
            ) : (
              <>
                <button
                  onClick={() => signIn("keycloak")}
                  className="relative px-8 py-4 rounded-xl font-semibold text-lg
                             bg-gradient-to-r from-blue-600 to-purple-600
                             hover:from-blue-500 hover:to-purple-500
                             transition-all duration-300 glow
                             shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                             text-white"
                >
                  Login to Become a Citizen
                  {/* Inner glow */}
                  <span
                    className="absolute inset-0 rounded-xl bg-white/5 pointer-events-none"
                    aria-hidden
                  />
                </button>
                <a
                  href="#world"
                  className="px-8 py-4 rounded-xl font-medium text-lg
                             border border-gray-700 hover:border-gray-500
                             text-gray-300 hover:text-white transition-all duration-300"
                >
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* ============================================================ */}
      {/* WORLD MAP SECTION                                             */}
      {/* ============================================================ */}
      <section id="world" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="gradient-text">Global Network</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Our citizens span every continent. Explore the network and find
              where your community thrives.
            </p>
          </div>

          {/* Map */}
          <div
            className={`transition-all duration-1000 ${
              mapVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {loading ? (
              <div className="glass-card p-8 flex items-center justify-center h-80">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm text-gray-500">
                    Loading global network…
                  </span>
                </div>
              </div>
            ) : (
              <WorldMapPreview regions={worldData?.regions ?? []} />
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION                                              */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🛡️",
              title: "Secure Identity",
              desc: "Your digital identity is cryptographically verified and sovereign.",
            },
            {
              icon: "🌐",
              title: "Global Presence",
              desc: "Join citizens from every region on a decentralized network.",
            },
            {
              icon: "⚡",
              title: "Instant Activation",
              desc: "Become a citizen in seconds with seamless onboarding.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-card p-6 text-center glow"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER                                                        */}
      {/* ============================================================ */}
      <footer className="mt-auto py-8 px-6 border-t border-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-600">
            © 2026 LostInVirtual Registry. Secure. Sovereign.
          </span>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a
              href="#"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-gray-300 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-gray-300 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
