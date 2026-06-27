'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/* ------------------------------------------------------------------ */
/* Count-up animation hook                                             */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

/* ------------------------------------------------------------------ */
/* Stats Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  const animated = useCountUp(value);

  return (
    <motion.div variants={fadeUp} className="glass-card p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`w-2 h-2 rounded-full ${color}`} />
      </div>
      <p className="text-3xl font-bold font-mono text-white">{animated}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider font-mono mt-1">{label}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Activity Item                                                       */
/* ------------------------------------------------------------------ */

function ActivityItem({ action, user, time }: { action: string; user: string; time: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
    >
      <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-sm flex-shrink-0">
        👤
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">
          <span className="text-blue-400 font-medium">{user}</span>{' '}
          {action}
        </p>
        <p className="text-xs text-gray-600 font-mono">{time}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard Page                                                      */
/* ------------------------------------------------------------------ */

interface DashboardData {
  totalCitizens: number;
  activeTokens: number;
  totalRegions: number;
  totalUsers: number;
  userRole: string;
  recentActivity: Array<{
    action: string;
    user: string;
    time: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      <Head>
        <title>Admin Dashboard — LostInVirtual</title>
      </Head>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-mono">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Header */}
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, <span className="gradient-text">{data?.userRole || 'Admin'}</span>
            </h1>
            <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your platform.</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="👥" label="Total Citizens" value={data?.totalCitizens ?? 0} color="bg-green-500" />
            <StatCard icon="🎫" label="Active Tokens" value={data?.activeTokens ?? 0} color="bg-blue-500" />
            <StatCard icon="🌍" label="Total Regions" value={data?.totalRegions ?? 0} color="bg-purple-500" />
            <StatCard icon="👤" label="Total Users" value={data?.totalUsers ?? 0} color="bg-amber-500" />
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={fadeUp} className="glass-card p-6">
            <h2 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-4">Recent Activity</h2>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <motion.div variants={stagger}>
                {data.recentActivity.map((activity, i) => (
                  <ActivityItem
                    key={i}
                    action={activity.action}
                    user={activity.user}
                    time={activity.time}
                  />
                ))}
              </motion.div>
            ) : (
              <p className="text-sm text-gray-600 py-4">No recent activity</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
