'use client';

import React, { useState } from 'react';

interface ActivationFormProps {
  onSuccess?: () => void;
}

export default function ActivationForm({ onSuccess }: ActivationFormProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [citizenNumber, setCitizenNumber] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Activation failed');
      }

      setCitizenNumber(data.citizen?.citizenNumber || null);
      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative max-w-md mx-auto">
        {/* Confetti particles */}
        <div className="confetti-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`confetti-piece confetti-${i % 5}`} />
          ))}
        </div>

        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-green-500/40 via-emerald-500/20 to-green-500/40">
          <div className="rounded-2xl bg-[#0a0a0f] p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Welcome, Citizen</h3>
            <p className="text-sm text-white/50 mb-4">Your citizenship has been activated</p>
            {citizenNumber && (
              <div className="inline-block px-4 py-2 bg-white/5 rounded-lg border border-white/10 mb-6">
                <span className="text-xs text-white/40 block mb-0.5">Your Citizen Number</span>
                <span className="text-lg font-mono font-bold text-white tracking-wider">{citizenNumber}</span>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-sm font-medium text-white transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto">
      {/* Gradient border */}
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/40 via-purple-500/20 to-blue-500/40">
        <div className="rounded-2xl bg-[#0a0a0f] p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Activate Your Citizenship</h3>
            <p className="text-sm text-white/40">Enter the token code from your merchandise</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Token Input */}
            <div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="XXXX-XXXX-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className={`w-full px-5 py-4 bg-white/[0.03] border rounded-xl text-center text-lg font-mono font-bold tracking-[0.2em] text-white placeholder-white/20 outline-none transition-all duration-300 ${
                  error
                    ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                    : 'border-white/10 focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                }`}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Activating...</span>
                </>
              ) : (
                <span>Activate Citizenship</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
