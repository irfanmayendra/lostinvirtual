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

interface UserData {
  id: string;
  username: string;
  email: string;
  displayName: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Role Badge                                                          */
/* ------------------------------------------------------------------ */

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MODERATOR: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CITIZEN: 'bg-green-500/10 text-green-400 border-green-500/20',
  VISITOR: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const ALL_ROLES = ['SUPERADMIN', 'ADMIN', 'MODERATOR', 'CITIZEN', 'VISITOR'];

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${ROLE_COLORS[role] || ROLE_COLORS.VISITOR}`}>
      {role}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Users Page                                                          */
/* ------------------------------------------------------------------ */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(search && { search }),
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Users — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} registered users</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="ALL">All Roles</option>
          {ALL_ROLES.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </motion.div>

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
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">User</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Role</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Joined</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    variants={fadeUp}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white/60">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            user.username[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.displayName || user.username}</p>
                          <p className="text-xs text-gray-600 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                      >
                        {ALL_ROLES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {users.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-600 text-sm">No users found</div>
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
