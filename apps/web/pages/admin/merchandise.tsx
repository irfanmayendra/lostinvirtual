'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: spring } };

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface MerchandiseData {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MerchForm {
  name: string;
  type: string;
  description: string;
  price: string;
  imageUrl: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const TYPE_ICONS: Record<string, string> = {
  TSHIRT: '👕',
  HOODIE: '🧥',
  JACKET: '🧥',
  CAP: '🧢',
};

const TYPE_COLORS: Record<string, string> = {
  TSHIRT: 'bg-green-500/10 text-green-400 border-green-500/20',
  HOODIE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  JACKET: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CAP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

const ALL_TYPES = ['TSHIRT', 'HOODIE', 'JACKET', 'CAP'];

const emptyForm: MerchForm = { name: '', type: 'TSHIRT', description: '', price: '', imageUrl: '' };

/* ------------------------------------------------------------------ */
/* Merchandise Page                                                    */
/* ------------------------------------------------------------------ */

export default function AdminMerchandisePage() {
  const [items, setItems] = useState<MerchandiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 15;

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MerchForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMerchandise = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
        ...(search && { search }),
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
        ...(activeFilter && { active: activeFilter }),
      });
      const res = await fetch(`/api/admin/merchandise?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching merchandise:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, activeFilter]);

  useEffect(() => { fetchMerchandise(); }, [fetchMerchandise]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId
        ? { id: editingId, ...form, price: parseFloat(form.price) }
        : { ...form, price: parseFloat(form.price) };

      const res = await fetch('/api/admin/merchandise', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        fetchMerchandise();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: MerchandiseData) => {
    setForm({
      name: item.name,
      type: item.type,
      description: item.description,
      price: String(item.price),
      imageUrl: item.imageUrl,
    });
    setEditingId(item.id);
    setShowForm(true);
    setError('');
  };

  const handleToggleActive = async (item: MerchandiseData) => {
    try {
      const res = await fetch('/api/admin/merchandise', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      if (res.ok) fetchMerchandise();
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/merchandise', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchMerchandise();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete');
        setDeleteConfirm(null);
      }
    } catch (err) {
      setError('Network error');
      setDeleteConfirm(null);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <AdminLayout>
      <Head>
        <title>Merchandise — Admin — LostInVirtual</title>
      </Head>

      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Merchandise</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} items in catalog</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); setError(''); }}
          className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          {showForm ? 'Cancel' : '+ Add Merchandise'}
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          className="glass-card p-4 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
        >
          <h3 className="text-sm font-medium text-white mb-3">
            {editingId ? 'Edit Merchandise' : 'New Merchandise'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
            >
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <input
              type="number"
              placeholder="Price"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-blue-500/50 transition-all"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.price}
            className="mt-3 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : editingId ? 'Update Merchandise' : 'Create Merchandise'}
          </button>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        className="flex items-center gap-3 mb-6 flex-wrap"
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
            placeholder="Search merchandise..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          {['ALL', ...ALL_TYPES].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                typeFilter === t
                  ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'ALL' ? 'All' : `${TYPE_ICONS[t]} ${t}`}
            </button>
          ))}
        </div>

        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-gray-400 focus:outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="">All Status</option>
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
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Item</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Description</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Price</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] text-gray-500 uppercase tracking-wider font-mono font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <motion.tr
                    key={item.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    variants={fadeUp}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/[0.08]" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center text-sm">
                            {TYPE_ICONS[item.type] || '📦'}
                          </div>
                        )}
                        <span className="text-sm font-medium text-white">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${TYPE_COLORS[item.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        <span>{TYPE_ICONS[item.type]}</span>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                      {item.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-mono">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border transition-all ${
                          item.active
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-green-400' : 'bg-gray-600'}`} />
                        {item.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400 hover:text-white transition-all font-mono"
                        >
                          Edit
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 transition-all font-mono"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-gray-400 hover:text-white transition-all font-mono"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/20 transition-all font-mono"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-600 text-sm">No merchandise found</div>
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
