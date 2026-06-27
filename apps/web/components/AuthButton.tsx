'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-lg bg-gray-800/60 animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    const initials = (session.user.name || 'U').charAt(0).toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10 shrink-0">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <span className="text-sm font-medium text-white/90 max-w-[120px] truncate hidden sm:inline">
            {session.user.name || 'Citizen'}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 text-xs font-medium text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-lg transition-all duration-200"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('keycloak')}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all duration-200"
    >
      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
      <span>Login</span>
    </button>
  );
}
