'use client';

import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface CitizenData {
  id: string;
  citizenNumber: string;
  city: string;
  country: string;
  countryCode: string;
  bio: string | null;
  activatedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string | null;
  };
  region: {
    name: string;
    countryCode: string;
  } | null;
}

interface TokenData {
  id: string;
  code: string;
  merchandiseType: string;
  batchNumber: string | null;
  status: string;
  activatedAt: string | null;
  user: {
    username: string;
    email: string;
  } | null;
}

interface RegionStats {
  name: string;
  countryCode: string;
  citizenCount: number;
  latitude: number;
  longitude: number;
}

/* ------------------------------------------------------------------ */
/* Badge component                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVATED: 'bg-green-500/10 text-green-400 border-green-500/20',
    UNUSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${colors[status] || colors.UNUSED}`}>
      {status}
    </span>
  );
}

function MerchBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    TSHIRT: '👕',
    HOODIE: '🧥',
    JACKET: '🧥',
    CAP: '🧢',
  };
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span>{icons[type] || '📦'}</span>
      <span className="text-gray-400">{type}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminDataPage() {
  const router = useRouter();
  const [citizens, setCitizens] = useState<CitizenData[]>([]);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [regions, setRegions] = useState<RegionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'citizens' | 'tokens' | 'regions'>('citizens');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [citRes, tokRes, regRes] = await Promise.all([
          fetch('/api/admin/citizens'),
          fetch('/api/admin/tokens'),
          fetch('/api/admin/regions'),
        ]);

        if (citRes.ok) setCitizens((await citRes.json()).citizens || []);
        if (tokRes.ok) setTokens((await tokRes.json()).tokens || []);
        if (regRes.ok) setRegions((await regRes.json()).regions || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCitizens = citizens.filter(
    (c) =>
      c.user.username.toLowerCase().includes(search.toLowerCase()) ||
      c.user.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.citizenNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTokens = tokens.filter(
    (t) =>
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.username.toLowerCase().includes(search.toLowerCase()) ||
      t.status.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRegions = regions.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.countryCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-mono">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Data Explorer — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl"
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={spring}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">
              <span className="gradient-text">LostInVirtual</span>
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-medium text-white/40 bg-white/[0.04] border border-white/[0.06] rounded-md font-mono">
              Data Explorer
            </span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            ← Home
          </button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats overview */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-8"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono mb-1">Total Citizens</p>
            <p className="text-3xl font-bold font-mono text-blue-400">{citizens.length}</p>
          </motion.div>
          <motion.div variants={fadeUp} className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono mb-1">Active Tokens</p>
            <p className="text-3xl font-bold font-mono text-green-400">
              {tokens.filter((t) => t.status === 'ACTIVATED').length}
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="glass-card p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono mb-1">Regions</p>
            <p className="text-3xl font-bold font-mono text-purple-400">{regions.length}</p>
          </motion.div>
        </motion.div>

        {/* Tabs + Search */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            {(['citizens', 'tokens', 'regions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        {/* Citizens Table */}
        {activeTab === 'citizens' && (
          <motion.div
            className="glass-card overflow-hidden"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Citizen ID</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Username</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Display Name</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Country</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">City</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Activated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCitizens.map((citizen) => (
                    <motion.tr
                      key={citizen.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      variants={fadeUp}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-blue-400 font-medium">{citizen.citizenNumber}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{citizen.user.username}</td>
                      <td className="px-4 py-3 text-sm text-white/60">{citizen.user.displayName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{citizen.user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <span className="font-mono text-xs text-gray-400">{citizen.countryCode}</span>
                          <span className="text-white/60">{citizen.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/60">{citizen.city}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {new Date(citizen.activatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCitizens.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-sm">No citizens found</div>
            )}
          </motion.div>
        )}

        {/* Tokens Table */}
        {activeTab === 'tokens' && (
          <motion.div
            className="glass-card overflow-hidden"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Token Code</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Batch</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Activated By</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Activated At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((token) => (
                    <motion.tr
                      key={token.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      variants={fadeUp}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-white/90 font-medium tracking-wider">{token.code}</td>
                      <td className="px-4 py-3"><MerchBadge type={token.merchandiseType} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{token.batchNumber || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={token.status} /></td>
                      <td className="px-4 py-3 text-sm text-white/60">{token.user?.username || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {token.activatedAt
                          ? new Date(token.activatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTokens.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-sm">No tokens found</div>
            )}
          </motion.div>
        )}

        {/* Regions Table */}
        {activeTab === 'regions' && (
          <motion.div
            className="glass-card overflow-hidden"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Code</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Country</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Citizens</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Latitude</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Longitude</th>
                    <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegions.map((region) => (
                    <motion.tr
                      key={region.countryCode}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                      variants={fadeUp}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-blue-400 font-medium">{region.countryCode}</td>
                      <td className="px-4 py-3 text-sm text-white/80">{region.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-purple-400 font-medium">{region.citizenCount}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{region.latitude.toFixed(4)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{region.longitude.toFixed(4)}</td>
                      <td className="px-4 py-3">
                        <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${Math.min((region.citizenCount / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredRegions.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-sm">No regions found</div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
