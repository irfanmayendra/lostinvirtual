'use client';

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-1.5 text-xs tracking-widest uppercase border border-cyber-magenta/40 text-cyber-magenta hover:bg-cyber-magenta/10 hover:border-cyber-magenta transition-all duration-300 cursor-pointer"
    >
      ◼ Logout
    </button>
  );
}
