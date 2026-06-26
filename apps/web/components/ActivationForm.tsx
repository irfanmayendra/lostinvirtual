'use client';

import { useState } from "react";

export function ActivationForm() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      // TODO: Replace with actual API call when activation endpoint is ready
      // const res = await fetch("/api/activation", {
      //   method: "POST",
      //   body: JSON.stringify({ code: code.trim() }),
      // });
      // const data = await res.json();

      // For now, show that the feature is not yet connected to backend
      setStatus("error");
      setMessage("Activation system not yet connected. Please try again later.");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="LIV-XXXX-XXXX"
          maxLength={13}
          className="w-full px-4 py-3 bg-cyber-bg border border-cyber-border text-cyber-cyan font-mono text-sm tracking-widest placeholder:text-cyber-muted/30 focus:outline-none focus:border-cyber-cyan/50 transition-colors"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyber-muted">
          {code.length}/13
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "loading" || code.length < 13}
        className="px-6 py-3 bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan font-bold text-xs tracking-widest uppercase hover:bg-cyber-cyan/20 hover:border-cyber-cyan transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "loading" ? "▸ Activating..." : "▸ Activate"}
      </button>

      {message && (
        <div className={`text-xs mt-2 ${status === "error" ? "text-cyber-magenta" : "text-cyber-green"}`}>
          {message}
        </div>
      )}
    </form>
  );
}
