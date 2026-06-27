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

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: string;
  user: {
    username: string;
    email: string;
    displayName: string | null;
  } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const perPage = 25;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entity: entityFilter }),
      });
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Audit Log — Admin — LostInVirtual</title>
      </Head>

      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <h1 className="text-xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} recorded events</p>
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          placeholder="Filter by action..."
          className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
        />
        <input
          type="text"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          placeholder="Filter by entity..."
          className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

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
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Time</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">User</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Action</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Entity</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    variants={fadeUp}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/70">
                      {log.user?.displayName || log.user?.username || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.entity}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono max-w-[200px] truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-600 text-sm">No audit logs found</div>
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>
          <span className="text-xs text-gray-600 font-mono">{page} / {totalPages}</span>
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
