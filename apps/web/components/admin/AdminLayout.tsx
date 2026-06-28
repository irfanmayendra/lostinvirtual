'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';

const spring = { type: 'spring' as const, stiffness: 100, damping: 20 };

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  minRole?: number;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: '📊', label: 'Dashboard', href: '/admin' },
  { icon: '👥', label: 'Users', href: '/admin/users', minRole: 80 },
  { icon: '🎫', label: 'Tokens', href: '/admin/tokens', minRole: 80 },
  { icon: '🌍', label: 'Regions', href: '/admin/regions', minRole: 60 },
  { icon: '📦', label: 'Merchandise', href: '/admin/merchandise', minRole: 80 },
  { icon: '📝', label: 'Content', href: '/admin/content', minRole: 80 },
  { icon: '📢', label: 'Announcements', href: '/admin/announcements', minRole: 80 },
  { icon: '📈', label: 'Analytics', href: '/admin/analytics', minRole: 80 },
  { icon: '⚙️', label: 'Settings', href: '/admin/settings', minRole: 100 },
  { icon: '📋', label: 'Audit Log', href: '/admin/audit', minRole: 100 },
];

const ROLE_LEVELS: Record<string, number> = {
  VISITOR: 0,
  CITIZEN: 20,
  MODERATOR: 60,
  ADMIN: 80,
  SUPERADMIN: 100,
};

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ADMIN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  MODERATOR: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CITIZEN: 'bg-green-500/10 text-green-400 border-green-500/20',
  VISITOR: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.userRole) setUserRole(data.userRole);
        } else {
          // API returned error (401/403) — not an admin
          setUserRole('VISITOR');
        }
      } catch {
        setUserRole('VISITOR');
      }
      setRoleLoaded(true);
    })();
  }, []);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === 'loading' || !roleLoaded) return;
    if (!session) {
      router.replace('/login?callbackUrl=' + encodeURIComponent('/admin'));
      return;
    }
    const level = ROLE_LEVELS[userRole] ?? 0;
    if (level < 80) {
      router.replace('/dashboard');
    }
  }, [session, status, userRole, roleLoaded, router]);

  if (status === 'loading' || !session || !roleLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-mono">Loading admin...</p>
        </div>
      </div>
    );
  }

  const filteredItems = MENU_ITEMS.filter(item => {
    if (!item.minRole) return true;
    return (ROLE_LEVELS[userRole] ?? 0) >= item.minRole;
  });

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col border-r border-white/[0.06] bg-black/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-[240px]'
        }`}
        initial={{ x: -240 }}
        animate={{ x: 0 }}
        transition={spring}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              L
            </div>
            {!collapsed && (
              <motion.span
                className="text-sm font-bold gradient-text whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                LostInVirtual
              </motion.span>
            )}
          </Link>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#18181b] border border-white/[0.08] flex items-center justify-center text-gray-500 hover:text-white transition-colors text-xs"
        >
          {collapsed ? '→' : '←'}
        </button>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <motion.span
                    className="whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                    layoutId="activeDot"
                    transition={spring}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="p-2 border-t border-white/[0.06]">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] transition-all"
          >
            <span className="text-base">🏠</span>
            {!collapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
        {/* Header */}
        <motion.header
          className="sticky top-0 z-30 h-16 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl flex items-center justify-between px-6"
          initial={{ y: -64 }}
          animate={{ y: 0 }}
          transition={spring}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-mono text-gray-500">
              / admin
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <span className={`inline-flex px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${ROLE_COLORS[userRole] || ROLE_COLORS.VISITOR}`}>
              {userRole}
            </span>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-400 max-w-[120px] truncate">
                {session.user?.name || session.user?.email}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              ↗
            </button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
