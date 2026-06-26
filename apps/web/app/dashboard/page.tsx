import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { ActivationForm } from "@/components/ActivationForm";

interface CitizenData {
  livId: string;
  nickname?: string | null;
  tier: string;
  status: string;
  city?: string | null;
  province?: string | null;
  createdAt?: Date | string;
  card?: { cardUrl?: string | null } | null;
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = session.user;
  const displayName = user.name || user.email?.split("@")[0] || "Unknown";
  const email = user.email || "no-email";

  // TODO: Query citizen from database when Step 3 (Database) is done
  // For now, show session data with empty states
  // const citizen = await prisma.citizen.findUnique({ where: { email } })
  const citizen = null as CitizenData | null;

  const isRegistered = !!citizen;
  const livId = citizen?.livId ?? "LIV-────────";
  const nickname = citizen?.nickname ?? displayName;
  const tier = citizen?.tier;
  const status = citizen?.status;
  const location = citizen?.city || citizen?.province || "—";
  const joinedDate = citizen?.createdAt
    ? new Date(citizen.createdAt).toLocaleDateString("id-ID")
    : "—";

  return (
    <main className="relative min-h-screen">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-tight">
              <span className="text-cyber-cyan">LIV</span>
              <span className="text-cyber-muted text-xs ml-1">v0.1</span>
            </span>
            <span className="text-cyber-border">│</span>
            <span className="text-xs text-cyber-muted tracking-widest uppercase">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-cyber-muted hidden sm:inline">
              {email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome banner */}
        <div className="text-xs text-cyber-muted tracking-widest uppercase mb-2">
          ▸ Welcome back,{" "}
          <span className="text-cyber-cyan">{displayName}</span>
        </div>

        {/* === HERO CARD === */}
        <section className="border border-cyber-border bg-cyber-surface/50 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-cyber-cyan via-cyber-purple to-transparent" />

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <div className="text-[10px] text-cyber-muted tracking-[0.3em] uppercase">
                Citizen Profile
              </div>

              <div
                className={`text-3xl md:text-4xl font-black tracking-tight font-mono ${
                  isRegistered
                    ? "text-cyber-cyan text-glow-cyan"
                    : "text-cyber-muted/50"
                }`}
              >
                {livId}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg text-white font-bold">
                  {nickname}
                </span>
                {tier ? (
                  <TierBadge tier={tier} />
                ) : (
                  <span className="text-[10px] px-2 py-0.5 border border-yellow-500/40 text-yellow-400 tracking-widest uppercase">
                    ◈ pending registration
                  </span>
                )}
                {status && <StatusBadge status={status} />}
              </div>
            </div>

            {/* Resident Card Preview */}
            <div className="shrink-0">
              <ResidentCardPreview
                citizen={citizen}
                displayName={displayName}
                email={email}
              />
            </div>
          </div>
        </section>

        {/* === QUICK STATS === */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Email" value={email} mono={false} />
          <StatCard
            label="Tier"
            value={tier?.toUpperCase() ?? "—"}
            color={tier ? "cyan" : "muted"}
          />
          <StatCard label="Joined" value={joinedDate} />
          <StatCard label="Location" value={location} />
        </section>

        {/* === ACTION AREA === */}
        <section className="border border-cyber-border bg-cyber-surface/50 p-6">
          <div className="text-[10px] text-cyber-muted tracking-[0.3em] uppercase mb-4">
            ▸ Actions
          </div>

          {status === "ACTIVE" ? (
            <ActiveCitizenActions />
          ) : (
            <PendingCitizenActions />
          )}
        </section>
      </div>
    </main>
  );
}

/* === Sub-components === */

function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    common: { label: "◆ COMMON", cls: "tier-common" },
    rare: { label: "◆ RARE", cls: "tier-rare" },
    epic: { label: "◆ EPIC", cls: "tier-epic" },
    legendary: {
      label: "★ LEGENDARY",
      cls: "tier-legendary",
    },
  };
  const t = config[tier] || config.common;
  return (
    <span
      className={`text-[10px] px-2 py-0.5 tracking-widest uppercase font-bold ${t.cls}`}
    >
      {t.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`text-[10px] px-2 py-0.5 border tracking-widest uppercase ${
        isActive
          ? "border-cyber-green/40 text-cyber-green"
          : "border-yellow-500/40 text-yellow-400"
      }`}
    >
      {isActive ? "● active" : "◈ pending"}
    </span>
  );
}

function ResidentCardPreview({
  citizen,
  displayName,
}: {
  citizen: CitizenData | null;
  displayName: string;
  email: string;
}) {
  return (
    <div className="w-64 h-40 border border-cyber-border bg-gradient-to-br from-cyber-surface to-cyber-bg relative overflow-hidden rounded-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 to-cyber-purple/5" />

      <div className="relative p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="text-[8px] tracking-[0.3em] text-cyber-cyan/60 uppercase">
            Resident Card
          </div>
          <div className="text-[8px] text-cyber-muted">LIV</div>
        </div>

        <div>
          {citizen ? (
            <>
              <div className="text-sm font-bold text-white">
                {citizen.nickname || displayName}
              </div>
              <div className="text-[10px] text-cyber-cyan font-mono">
                {citizen.livId}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-cyber-muted/50">
                Not Generated
              </div>
              <div className="text-[10px] text-cyber-muted/30 font-mono">
                Complete registration first
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div className="text-[8px] text-cyber-muted">
            {citizen?.city || "—"}
          </div>
          {citizen?.card?.cardUrl ? (
            <a
              href={citizen.card.cardUrl}
              className="text-[8px] text-cyber-cyan hover:underline"
            >
              View Full →
            </a>
          ) : (
            <span className="text-[8px] text-cyber-muted/30">—</span>
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-cyber-cyan/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-cyber-purple/20" />
    </div>
  );
}

function StatCard({
  label,
  value,
  mono = true,
  color,
}: {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
}) {
  const colorClass =
    color === "cyan"
      ? "text-cyber-cyan"
      : color === "muted"
        ? "text-cyber-muted"
        : "text-white";
  return (
    <div className="border border-cyber-border bg-cyber-surface/50 p-4">
      <div className="text-[10px] text-cyber-muted tracking-[0.2em] uppercase mb-1">
        {label}
      </div>
      <div
        className={`text-sm font-bold truncate ${colorClass} ${mono ? "font-mono" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function ActiveCitizenActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <ActionLink
        href="#"
        label="▸ Citizen Map"
        desc="Explore the virtual world"
        color="cyan"
      />
      <ActionLink
        href="#"
        label="▸ Download Card"
        desc="Get your resident card"
        color="purple"
      />
    </div>
  );
}

function PendingCitizenActions() {
  return (
    <div className="space-y-4">
      <div className="text-sm text-cyber-muted">
        Your citizen profile has not been activated yet. Enter your activation
        code to proceed.
      </div>
      <ActivationForm />
    </div>
  );
}

function ActionLink({
  href,
  label,
  desc,
  color,
}: {
  href: string;
  label: string;
  desc: string;
  color: string;
}) {
  const borderColor =
    color === "cyan"
      ? "border-cyber-cyan/30 hover:border-cyber-cyan"
      : "border-cyber-purple/30 hover:border-cyber-purple";
  const textColor = color === "cyan" ? "text-cyber-cyan" : "text-cyber-purple";
  return (
    <a
      href={href}
      className={`block p-4 border ${borderColor} bg-cyber-surface/30 transition-all duration-300 group`}
    >
      <div className={`text-sm font-bold ${textColor} group-hover:underline`}>
        {label}
      </div>
      <div className="text-xs text-cyber-muted mt-1">{desc}</div>
    </a>
  );
}
