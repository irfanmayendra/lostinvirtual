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

interface ContentEntry {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string;
  type: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const PAGES = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'login', label: 'Login Page' },
  { value: 'signup', label: 'Signup Page' },
];

const SECTIONS = ['hero', 'features', 'howItWorks', 'cta', 'footer', 'general'];
const TYPES = ['text', 'image', 'json', 'boolean'];

/* ------------------------------------------------------------------ */
/* CMS Content Page                                                    */
/* ------------------------------------------------------------------ */

export default function AdminContentPage() {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landing');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ section: 'hero', key: '', value: '', type: 'text', order: 0 });

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageFilter: activeTab,
        limit: '100',
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/content?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleEdit = (entry: ContentEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.value);
  };

  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value: editValue }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchEntries();
      }
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content entry?')) return;
    try {
      const res = await fetch('/api/admin/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error('Error deleting content:', err);
    }
  };

  const handleAdd = async () => {
    if (!newEntry.key.trim()) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: activeTab,
          section: newEntry.section,
          key: newEntry.key,
          value: newEntry.value,
          type: newEntry.type,
          order: newEntry.order,
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        setNewEntry({ section: 'hero', key: '', value: '', type: 'text', order: 0 });
        fetchEntries();
      }
    } catch (err) {
      console.error('Error adding content:', err);
    } finally {
      setSaving(false);
    }
  };

  // Group entries by section
  const grouped = entries.reduce<Record<string, ContentEntry[]>>((acc, entry) => {
    if (!acc[entry.section]) acc[entry.section] = [];
    acc[entry.section].push(entry);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <Head>
        <title>Content — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Content Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Edit page content across the platform</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          {showAdd ? 'Cancel' : '+ Add Entry'}
        </button>
      </motion.div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="glass-card p-4 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
          >
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-3">New Content Entry</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <select
                value={newEntry.section}
                onChange={(e) => setNewEntry({ ...newEntry, section: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={newEntry.key}
                onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
                placeholder="Key (e.g. title)"
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <input
                type="text"
                value={newEntry.value}
                onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
                placeholder="Value"
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all col-span-2 md:col-span-1"
              />
              <select
                value={newEntry.type}
                onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
              >
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={handleAdd}
                disabled={saving || !newEntry.key.trim()}
                className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
              >
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Tabs + Search */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {PAGES.map((p) => (
            <button
              key={p.value}
              onClick={() => { setActiveTab(p.value); setSearch(''); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === p.value
                  ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.label}
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
            placeholder="Search keys..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </motion.div>

      {/* Content Groups */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card py-12 text-center text-gray-600 text-sm">
          No content entries found for this page
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {Object.entries(grouped).map(([section, items]) => (
            <motion.div key={section} className="glass-card overflow-hidden" variants={fadeUp}>
              {/* Section Header */}
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">{section}</span>
                <span className="text-[10px] text-gray-600 font-mono">{items.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      <th className="px-4 py-2 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Key</th>
                      <th className="px-4 py-2 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Value</th>
                      <th className="px-4 py-2 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Type</th>
                      <th className="px-4 py-2 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Updated</th>
                      <th className="px-4 py-2 text-right text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                        variants={fadeUp}
                      >
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-mono text-white/80">{entry.key}</span>
                        </td>
                        <td className="px-4 py-2.5 max-w-md">
                          {editingId === entry.id ? (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-blue-500/30 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all resize-y min-h-[36px]"
                              rows={2}
                            />
                          ) : (
                            <p className="text-sm text-gray-400 truncate max-w-xs" title={entry.value}>
                              {entry.value.length > 120 ? entry.value.slice(0, 120) + '…' : entry.value}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border bg-white/[0.03] text-gray-500 border-white/[0.06]">
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 font-mono">
                          {new Date(entry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {editingId === entry.id ? (
                              <>
                                <button
                                  onClick={() => handleSave(entry.id)}
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
                                  onClick={() => handleEdit(entry)}
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
            </motion.div>
          ))}
        </motion.div>
      )}
    </AdminLayout>
  );
}
