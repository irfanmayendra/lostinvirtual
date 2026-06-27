'use client';

import React from 'react';

interface Citizen {
  id: string;
  citizenNumber: string;
  region?: { id: string; name: string; countryCode?: string; [key: string]: any } | string | null;
  regionName?: string;
  city: string;
  country: string;
  countryCode?: string;
  bio?: string;
  activatedAt: string;
  achievements?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    points?: number;
    earnedAt?: string;
  }>;
  [key: string]: any;
}

interface CitizenCardProps {
  citizen: Citizen;
}

function getRegionName(citizen: Citizen): string {
  if (citizen.regionName) return citizen.regionName;
  if (citizen.region && typeof citizen.region === 'object' && 'name' in citizen.region) {
    return citizen.region.name;
  }
  if (typeof citizen.region === 'string') return citizen.region;
  return 'Unknown';
}

function formatDate(date: string): string {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function CitizenCard({ citizen }: CitizenCardProps) {
  const initials = (citizen.city || 'C').charAt(0).toUpperCase();
  const regionName = getRegionName(citizen);

  return (
    <div className="citizen-card group relative rounded-2xl overflow-hidden transition-all duration-500 hover:rotate-1 hover:scale-[1.01]">
      {/* Outer glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative rounded-2xl bg-[#0c0c14] border border-white/[0.06] overflow-hidden">
        {/* Header Bar */}
        <div className="relative h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 overflow-hidden">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-xs font-black tracking-tighter">LIV</span>
              </div>
              <span className="text-white/90 text-sm font-bold tracking-[0.15em] uppercase">LostInVirtual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/80 text-xs font-medium">Active Citizen</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Avatar + Citizen Number */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <span className="text-white text-xl font-black">{initials}</span>
            </div>
            <div>
              <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-0.5">Citizen ID</p>
              <p className="text-xl font-mono font-black text-white tracking-wider">{citizen.citizenNumber}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <InfoItem icon="🌍" label="Region" value={regionName} />
            <InfoItem icon="🏙️" label="City" value={citizen.city || '—'} />
            <InfoItem icon="🇮🇩" label="Country" value={citizen.country || '—'} />
            <InfoItem icon="📅" label="Activated" value={formatDate(citizen.activatedAt)} />
          </div>

          {/* Achievements */}
          {citizen.achievements && citizen.achievements.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06]">
              <p className="text-xs text-white/30 font-medium uppercase tracking-wider mb-3">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {citizen.achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg"
                  >
                    {ach.icon && <span className="text-sm">{ach.icon}</span>}
                    <span className="text-xs text-white/60 font-medium">{ach.name}</span>
                    {ach.points && (
                      <span className="text-[10px] text-white/30 ml-0.5">+{ach.points}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] text-white/30 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm text-white/80 font-medium truncate">{value}</p>
    </div>
  );
}
