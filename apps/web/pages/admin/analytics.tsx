'use client';

import React from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout>
      <Head>
        <title>Analytics — Admin — LostInVirtual</title>
      </Head>
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-4xl mb-4">📈</span>
        <h2 className="text-lg font-bold text-white mb-2">Analytics Dashboard</h2>
        <p className="text-sm text-gray-500">Coming soon — detailed analytics and growth metrics.</p>
      </div>
    </AdminLayout>
  );
}
