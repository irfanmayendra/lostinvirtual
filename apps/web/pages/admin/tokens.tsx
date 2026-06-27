'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface TokenData {
  id: string;
  code: string;
  merchandiseType: string;
  batchNumber: string | null;
  status: string;
  activatedAt: string | null;
  createdAt: string;
  user: {
    username: string;
    email: string;
  } | null;
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<string, string> = {
  ACTIVATED: 'bg-green-500/10 text-green-400 border-green-500/20',
  UNUSED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${STATUS_COLORS[status] || STATUS_COLORS.UNUSED}`}>
      {status}
    </span>
  );
}

const TYPE_ICONS: Record<string, string> = {
  TSHIRT: '👕',
  HOODIE: '🧥',
  JACKET: '🧥',
  CAP: '🧢',
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span>{TYPE_ICONS[type] || '📦'}</span>
      <span className="text-gray-400 font-mono">{type}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tokens Page                                                         */
/* ------------------------------------------------------------------ */

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genCount, setGenCount] = useState(10);
  const [genType, setGenType] = useState('TSHIRT');
  const perPage = 15;

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
      });
      const res = await fetch(`/api/admin/tokens?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const handleRevoke = async (tokenId: string) => {
    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, status: 'SUSPENDED' }),
      });
      if (res.ok) fetchTokens();
    } catch (err) {
      console.error('Error revoking token:', err);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: genCount, merchandiseType: genType }),
      });
      if (res.ok) {
        fetchTokens();
      }
    } catch (err) {
      console.error('Error generating tokens:', err);
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Tokens — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Tokens</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total tokens</p>
        </div>
      </motion.div>

      {/* Generate Panel */}
      <motion.div
        className="glass-card p-4 mb-6 flex items-center gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Generate</span>
        <input
          type="number"
          min={1}
          max={100}
          value={genCount}
          onChange={(e) => setGenCount(Number(e.target.value))}
          className="w-20 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white font-mono focus:outline-none focus:border-blue-500/50 transition-all"
        />
        <select
          value={genType}
          onChange={(e) => setGenType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="TSHIRT">T-Shirt</option>
          <option value="HOODIE">Hoodie</option>
          <option value="JACKET">Jacket</option>
          <option value="CAP">Cap</option>
        </select>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {['ALL', 'UNUSED', 'ACTIVATED', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                statusFilter === status
                  ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="ALL">All Types</option>
          <option value="TSHIRT">T-Shirt</option>
          <option value="HOODIE">Hoodie</option>
          <option value="JACKET">Jacket</option>
          <option value="CAP">Cap</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        className="glass-card overflow-hidden"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Code</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Batch</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Activated By</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token) => (
                  <motion.tr
                    key={token.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    variants={fadeUp}
                  >
                    <td className="px-4 py-3 font-mono text-sm text-white/90 font-medium tracking-wider">{token.code}</td>
                    <td className="px-4 py-3"><TypeBadge type={token.merchandiseType} /></td>
                    <td className="px-4 py-3"><StatusBadge status={token.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{token.batchNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-white/60">{token.user?.username || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {token.activatedAt
                        ? new Date(token.activatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {token.status === 'UNUSED' && (
                        <button
                          onClick={() => handleRevoke(token.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 transition-all font-mono"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tokens.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-600 text-sm">No tokens found</div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-600 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
