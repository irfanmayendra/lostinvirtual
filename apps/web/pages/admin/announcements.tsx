'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
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

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const ANN_TYPES = ['info', 'warning', 'success', 'error'];

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
};

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${TYPE_COLORS[type] || TYPE_COLORS.info}`}>
      <span>{TYPE_ICONS[type] || '📢'}</span>
      {type}
    </span>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${
      active
        ? 'bg-green-500/10 text-green-400 border-green-500/20'
        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }`}>
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Announcements Page                                                  */
/* ------------------------------------------------------------------ */

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', type: 'info', active: true, startsAt: '', endsAt: '' });
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', content: '', type: 'info', startsAt: '', endsAt: '' });

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(search && { search }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
        ...(activeFilter !== 'ALL' && { active: activeFilter }),
      });
      const res = await fetch(`/api/admin/announcements?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, activeFilter]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startsAt: formData.startsAt || null,
          endsAt: formData.endsAt || null,
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ title: '', content: '', type: 'info', active: true, startsAt: '', endsAt: '' });
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const startEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setEditData({
      title: ann.title,
      content: ann.content,
      type: ann.type,
      startsAt: ann.startsAt ? ann.startsAt.slice(0, 16) : '',
      endsAt: ann.endsAt ? ann.endsAt.slice(0, 16) : '',
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...editData,
          startsAt: editData.startsAt || null,
          endsAt: editData.endsAt || null,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Error updating announcement:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Announcements — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Announcements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage platform-wide announcement banners</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          {showCreate ? 'Cancel' : '+ New Announcement'}
        </button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="glass-card p-4 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
          >
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">New Announcement</p>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                  className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                  >
                    {ANN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-white/20 bg-white/[0.04] text-blue-500 focus:ring-blue-500/50"
                    />
                    Active
                  </label>
                </div>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement content..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-y"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-600 font-mono uppercase mb-1 block">Starts At</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-600 font-mono uppercase mb-1 block">Ends At</label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleCreate}
                    disabled={saving || !formData.title.trim() || !formData.content.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
                  >
                    {saving ? 'Creating...' : 'Create Announcement'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search announcements..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {['ALL', 'info', 'warning', 'success', 'error'].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === t
                  ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'ALL' ? 'All' : t}
            </button>
          ))}
        </div>

        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Title</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Schedule</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Created</th>
                  <th className="px-4 py-3 text-right text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <motion.tr
                    key={ann.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    variants={fadeUp}
                  >
                    <td className="px-4 py-3">
                      {editingId === ann.id ? (
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-blue-500/30 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-white">{ann.title}</p>
                          <p className="text-xs text-gray-600 truncate max-w-xs mt-0.5">{ann.content}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === ann.id ? (
                        <select
                          value={editData.type}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                          className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                        >
                          {ANN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <TypeBadge type={ann.type} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(ann.id, ann.active)}>
                        <ActiveBadge active={ann.active} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === ann.id ? (
                        <div className="space-y-1">
                          <input
                            type="datetime-local"
                            value={editData.startsAt}
                            onChange={(e) => setEditData({ ...editData, startsAt: e.target.value })}
                            className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                          />
                          <input
                            type="datetime-local"
                            value={editData.endsAt}
                            onChange={(e) => setEditData({ ...editData, endsAt: e.target.value })}
                            className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-mono space-y-0.5">
                          {ann.startsAt && <div>From: {new Date(ann.startsAt).toLocaleDateString()}</div>}
                          {ann.endsAt && <div>To: {new Date(ann.endsAt).toLocaleDateString()}</div>}
                          {!ann.startsAt && !ann.endsAt && <span className="text-gray-600">—</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                      {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === ann.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(ann.id)}
                              disabled={saving}
                              className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-all font-mono"
                            >
                              {saving ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-500 hover:text-white transition-all font-mono"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(ann)}
                              className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 hover:bg-blue-500/20 transition-all font-mono"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(ann.id)}
                              className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 transition-all font-mono"
                            >
                              Del
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {announcements.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-600 text-sm">No announcements found</div>
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
