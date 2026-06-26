import { auth } from "@/lib/auth";
import Link from "next/link";
import { LoginButton } from "@/components/LoginButton";

const ROADMAP = [
  { phase: "01", title: "Citizen Registry", desc: "Register your digital identity", status: "active", border: "hover:border-cyber-cyan/40", accent: "text-cyber-cyan", badge: "border-cyber-cyan/30 text-cyber-cyan" },
  { phase: "02", title: "Activation System", desc: "Activate your citizen card with activation codes", status: "upcoming", border: "hover:border-cyber-purple/40", accent: "text-cyber-purple", badge: "border-cyber-purple/30 text-cyber-purple" },
  { phase: "03", title: "Resident Card", desc: "Generate your digital resident card", status: "upcoming", border: "hover:border-cyber-magenta/40", accent: "text-cyber-magenta", badge: "border-cyber-magenta/30 text-cyber-magenta" },
  { phase: "04", title: "Citizen Map", desc: "Explore the virtual world map", status: "upcoming", border: "hover:border-cyber-green/40", accent: "text-cyber-green", badge: "border-cyber-green/30 text-cyber-green" },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-4 text-xs tracking-[0.3em] uppercase text-cyber-cyan/60 animate-flicker">
          ▸ SYSTEM ONLINE ▸ NETWORK ACTIVE
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-2">
          <span className="text-cyber-cyan text-glow-cyan">LOST</span>
          <span className="text-cyber-purple text-glow-purple">IN</span>
          <span className="text-white">VIRTUAL</span>
        </h1>

        <div className="w-32 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent mb-6" />

        <p className="text-cyber-muted text-sm md:text-base max-w-md mb-10 leading-relaxed">
          The digital frontier&apos;s premier citizen registry. Register your identity, 
          activate your citizen card, and join the network.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="group relative px-8 py-3 bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan font-bold text-sm tracking-widest uppercase hover:bg-cyber-cyan/20 hover:border-cyber-cyan transition-all duration-300 glow-cyan"
            >
              <span className="relative z-10">▸ Enter Dashboard</span>
            </Link>
          ) : (
            <>
              <LoginButton mode="signin" />
              <LoginButton mode="register" />
            </>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-16 flex gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-cyber-cyan text-glow-cyan">0</div>
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Citizens</div>
          </div>
          <div className="w-px h-12 bg-cyber-border" />
          <div>
            <div className="text-2xl font-bold text-cyber-purple text-glow-purple">—</div>
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">Active Regions</div>
          </div>
          <div className="w-px h-12 bg-cyber-border" />
          <div>
            <div className="text-2xl font-bold text-cyber-green">ONLINE</div>
            <div className="text-[10px] text-cyber-muted tracking-widest uppercase">System</div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce text-cyber-muted text-xs">
          ▼ scroll ▼
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            <span className="text-cyber-cyan">▸</span> ROADMAP
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROADMAP.map((item) => (
              <div
                key={item.phase}
                className={`p-6 border border-cyber-border bg-cyber-surface/50 ${item.border} transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`${item.accent} font-mono text-sm`}>PHASE {item.phase}</span>
                  <span className={`text-[10px] px-2 py-0.5 border ${item.badge} tracking-widest uppercase`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-cyber-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-8 px-4 text-center">
        <div className="text-xs text-cyber-muted">
          <span className="text-cyber-cyan">▸</span> LostInVirtual &copy; 2026 — All rights reserved
        </div>
      </footer>
    </main>
  );
}
