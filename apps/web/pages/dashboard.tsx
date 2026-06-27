'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import AuthButton from '@/components/AuthButton';
import ActivationForm from '@/components/ActivationForm';
import CitizenCard from '@/components/CitizenCard';

interface Citizen {
  id: string;
  citizenNumber: string;
  region?: { id: string; name: string; countryCode?: string; [key: string]: any } | string | null;
  regionName?: string;
  city: string;
  country: string;
  countryCode?: string;
  bio?: string;
  achievements?: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    points?: number;
    earnedAt?: string;
  }>;
  activatedAt: string;
  createdAt?: string;
  [key: string]: any;
}

function getRegionName(citizen: Citizen): string {
  if (citizen.regionName) return citizen.regionName;
  if (citizen.region && typeof citizen.region === 'object' && 'name' in citizen.region) {
    return citizen.region.name;
  }
  if (typeof citizen.region === 'string') return citizen.region;
  return '—';
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitizenInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/citizen/me');
      if (res.ok) {
        const data = await res.json();
        setCitizen(data.citizen);
      } else if (res.status === 401) {
        setCitizen(null);
      } else {
        setCitizen(null);
      }
    } catch (err: any) {
      console.error('Error fetching citizen info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
    if (status === 'authenticated') {
      fetchCitizenInfo();
    }
  }, [status, router, fetchCitizenInfo]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#08080c] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-white/30">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const regionName = citizen ? getRegionName(citizen) : '—';
  const totalPoints = citizen?.achievements?.reduce((sum, a) => sum + (a.points || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#08080c] text-white">
      <Head>
        <title>Dashboard | LostInVirtual</title>
      </Head>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08080c]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                LostInVirtual
              </span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-md">
              Dashboard
            </span>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-1">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{session.user?.name || 'Citizen'}</span>
          </h2>
          <p className="text-sm text-white/30">Here&apos;s your digital citizenship overview</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {citizen ? (
          <div className="space-y-6">
            <CitizenCard citizen={citizen} />

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Card */}
              <div className="rounded-xl bg-[#0c0c14] border border-white/[0.06] p-5">
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Location</h3>
                <div className="space-y-3">
                  <Row icon="🌍" label="Region" value={regionName} />
                  <Row icon="🏙️" label="City" value={citizen.city || '—'} />
                  <Row icon="🇮🇩" label="Country" value={citizen.country || '—'} />
                </div>
              </div>

              {/* Account Card */}
              <div className="rounded-xl bg-[#0c0c14] border border-white/[0.06] p-5">
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Account</h3>
                <div className="space-y-3">
                  <Row icon="🔑" label="Citizen ID" value={citizen.citizenNumber || '—'} mono />
                  <Row icon="📅" label="Activated" value={formatDate(citizen.activatedAt)} />
                  <Row
                    icon="✅"
                    label="Status"
                    value={<span className="text-green-400 font-medium">Active</span>}
                  />
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-xl bg-[#0c0c14] border border-white/[0.06] p-5">
                <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-4">Stats</h3>
                <div className="space-y-3">
                  <Row icon="🏆" label="Achievements" value={String(citizen.achievements?.length || 0)} />
                  <Row icon="⭐" label="Total Points" value={String(totalPoints)} />
                  <Row icon="👤" label="Bio" value={citizen.bio || 'No bio yet'} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <p className="text-sm text-white/30">You haven&apos;t activated your citizenship yet. Enter your token to get started.</p>
            </div>
            <ActivationForm onSuccess={fetchCitizenInfo} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-xs text-white/20">© 2026 LostInVirtual</span>
          <span className="text-xs text-white/20">Digital Citizenship Platform</span>
        </div>
      </footer>
    </div>
  );
}

function Row({ icon, label, value, mono }: { icon: string; label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <span className={`text-sm text-white/80 font-medium ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
