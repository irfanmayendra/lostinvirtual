'use client';

import { signIn } from "next-auth/react";

interface LoginButtonProps {
  mode: "signin" | "register";
}

export function LoginButton({ mode }: LoginButtonProps) {
  const isSignIn = mode === "signin";

  return (
    <button
      onClick={() => signIn("keycloak")}
      className={`group relative px-8 py-3 font-bold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer ${
        isSignIn
          ? "bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan/20 hover:border-cyber-cyan glow-cyan"
          : "bg-cyber-purple/10 border border-cyber-purple/50 text-cyber-purple hover:bg-cyber-purple/20 hover:border-cyber-purple glow-purple"
      }`}
    >
      <span className="relative z-10">
        {isSignIn ? "▸ Sign In" : "▸ Join as Citizen"}
      </span>
    </button>
  );
}
