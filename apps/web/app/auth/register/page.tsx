'use client';

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function RegisterPage() {
  useEffect(() => {
    // Redirect to Keycloak — registration happens there
    signIn("keycloak");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-bg text-cyber-text">
      <div className="text-xs text-cyber-muted tracking-widest uppercase animate-pulse-glow">
        ▸ Redirecting to identity provider...
      </div>
    </div>
  );
}
