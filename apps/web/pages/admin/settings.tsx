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

interface SeoEntry {
  id: string;
  page: string;
  title: string | null;
  description: string | null;
  ogImage: string | null;
  keywords: string | null;
  createdAt: string;
  updatedAt: string;
}

const TABS = [
  { value: 'seo', label: 'SEO Settings' },
  { value: 'general', label: 'General Settings' },
];

/* ------------------------------------------------------------------ */
/* Settings Page                                                       */
/* ------------------------------------------------------------------ */

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('seo');
  const [seoEntries, setSeoEntries] = useState<SeoEntry[]>([]);
  const [seoLoading, setSeoLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: '', description: '', ogImage: '', keywords: '' });
  const [saving, setSaving] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState('');
  const [newData, setNewData] = useState({ title: '', description: '', ogImage: '', keywords: '' });

  const fetchSeo = useCallback(async () => {
    try {
      setSeoLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/seo?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSeoEntries(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching SEO settings:', err);
    } finally {
      setSeoLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (activeTab === 'seo') fetchSeo();
  }, [activeTab, fetchSeo]);

  const startEdit = (entry: SeoEntry) => {
    setEditingId(entry.id);
    setEditData({
      title: entry.title || '',
      description: entry.description || '',
      ogImage: entry.ogImage || '',
      keywords: entry.keywords || '',
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editData }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchSeo();
      }
    } catch (err) {
      console.error('Error updating SEO:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newPage.trim()) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: newPage, ...newData }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewPage('');
        setNewData({ title: '', description: '', ogImage: '', keywords: '' });
        fetchSeo();
      }
    } catch (err) {
      console.error('Error creating SEO setting:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this SEO setting?')) return;
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchSeo();
    } catch (err) {
      console.error('Error deleting SEO setting:', err);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Settings — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform configuration and SEO management</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-6 w-fit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.value
                ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <>
          {/* Toolbar */}
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
                placeholder="Search pages..."
                className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 transition-all"
            >
              {showCreate ? 'Cancel' : '+ Add Page SEO'}
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
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">New SEO Setting</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newPage}
                      onChange={(e) => setNewPage(e.target.value)}
                      placeholder="Page slug (e.g. home, login, dashboard)"
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      value={newData.title}
                      onChange={(e) => setNewData({ ...newData, title: e.target.value })}
                      placeholder="Meta title"
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                  <textarea
                    value={newData.description}
                    onChange={(e) => setNewData({ ...newData, description: e.target.value })}
                    placeholder="Meta description"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-y"
                    rows={2}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newData.ogImage}
                      onChange={(e) => setNewData({ ...newData, ogImage: e.target.value })}
                      placeholder="OG Image URL"
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      value={newData.keywords}
                      onChange={(e) => setNewData({ ...newData, keywords: e.target.value })}
                      placeholder="Keywords (comma-separated)"
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={saving || !newPage.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEO Table */}
          <motion.div
            className="glass-card overflow-hidden"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {seoLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Page</th>
                      <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Title</th>
                      <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Description</th>
                      <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">OG Image</th>
                      <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Keywords</th>
                      <th className="px-4 py-3 text-right text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoEntries.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        variants={fadeUp}
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 text-xs font-mono font-medium rounded-md border bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {entry.page}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {editingId === entry.id ? (
                            <input
                              type="text"
                              value={editData.title}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-blue-500/30 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                              placeholder="Meta title"
                            />
                          ) : (
                            <span className="text-sm text-white/80">{entry.title || <span className="text-gray-600">—</span>}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-sm">
                          {editingId === entry.id ? (
                            <textarea
                              value={editData.description}
                              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-blue-500/30 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-y"
                              rows={2}
                              placeholder="Meta description"
                            />
                          ) : (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{entry.description || '—'}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === entry.id ? (
                            <input
                              type="text"
                              value={editData.ogImage}
                              onChange={(e) => setEditData({ ...editData, ogImage: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                              placeholder="URL"
                            />
                          ) : (
                            entry.ogImage ? (
                              <a href={entry.ogImage} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate block max-w-[120px]">
                                {entry.ogImage.replace(/^https?:\/\//, '').slice(0, 20)}…
                              </a>
                            ) : (
                              <span className="text-xs text-gray-600">—</span>
                            )
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === entry.id ? (
                            <input
                              type="text"
                              value={editData.keywords}
                              onChange={(e) => setEditData({ ...editData, keywords: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg bg-white/[0.04] border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                              placeholder="keyword1, keyword2"
                            />
                          ) : (
                            <span className="text-xs text-gray-500 truncate block max-w-[150px]">{entry.keywords || '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {editingId === entry.id ? (
                              <>
                                <button
                                  onClick={() => handleUpdate(entry.id)}
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
                                  onClick={() => startEdit(entry)}
                                  className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 hover:bg-blue-500/20 transition-all font-mono"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
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

            {seoEntries.length === 0 && !seoLoading && (
              <div className="py-12 text-center text-gray-600 text-sm">No SEO settings found</div>
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
        </>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <motion.div
          className="glass-card p-8 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <span className="text-4xl mb-4 block">⚙️</span>
          <h3 className="text-lg font-bold text-white mb-2">General Settings</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            General platform configuration will be available here in a future update.
            This includes site name, maintenance mode, registration settings, and more.
          </p>
        </motion.div>
      )}
    </AdminLayout>
  );
}
