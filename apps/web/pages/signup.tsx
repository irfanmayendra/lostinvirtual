"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import GradientText from "@/components/ui/GradientText";
import MotionButton from "@/components/ui/MotionButton";
import SignupSuccessPopup from "@/components/SignupSuccessPopup";

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const springTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/* Floating orb                                                        */
/* ------------------------------------------------------------------ */

function FloatingOrb({
  color,
  size,
  top,
  left,
  delay = 0,
}: {
  color: string;
  size: number;
  top: string;
  left: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        top,
        left,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
      }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -25, 15, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [regions, setRegions] = useState<Array<{ name: string; countryCode: string; latitude: number; longitude: number; citizenCount: number }>>([]);
  const [newCitizenNumber, setNewCitizenNumber] = useState<string>("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Fetch regions for the popup map
  useEffect(() => {
    fetch("/api/world-map")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions || []))
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!form.fullName.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.username.trim()) return "Username is required";
    if (form.username.length < 3) return "Username must be at least 3 characters";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
      setNewCitizenNumber(data.user?.citizenNumber || "");
      setShowPopup(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSignup();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden hero-gradient grid-bg noise-overlay">
        <Head>
          <title>Account Created — LostInVirtual</title>
        </Head>
        <FloatingOrb color="rgba(34,197,94,0.12)" size={400} top="-10%" left="20%" delay={0} />
        <FloatingOrb color="rgba(59,130,246,0.08)" size={350} top="50%" left="60%" delay={2} />

        <motion.div
          className="relative z-10 w-full max-w-md mx-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
        >
          <div className="glass-card p-8 sm:p-10 text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
            <p className="text-sm text-gray-400 mb-6">
              Welcome to LostInVirtual, {form.username}. You&apos;re now part of the global citizen network.
            </p>
            <MotionButton
              variant="primary"
              className="w-full py-4 text-base"
              onClick={() => router.push("/login")}
            >
              Sign In Now
            </MotionButton>
          </div>
        </motion.div>

        {/* Signup success popup with world map */}
        <SignupSuccessPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          username={form.username}
          citizenNumber={newCitizenNumber}
          regions={regions}
          newCountryCode=""
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden hero-gradient grid-bg noise-overlay">
      <Head>
        <title>Create Account — LostInVirtual</title>
        <meta
          name="description"
          content="Create your LostInVirtual citizen account and join the global digital citizen registry."
        />
      </Head>

      {/* Background orbs */}
      <FloatingOrb color="rgba(59,130,246,0.12)" size={450} top="-15%" left="15%" delay={0} />
      <FloatingOrb color="rgba(139,92,246,0.10)" size={350} top="50%" left="65%" delay={2} />
      <FloatingOrb color="rgba(236,72,153,0.06)" size={300} top="70%" left="5%" delay={4} />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Logo / Brand */}
          <motion.div
            variants={fadeUp}
            transition={springTransition}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              <GradientText>LostInVirtual</GradientText>
            </h1>
            <p className="text-sm text-gray-500">
              Create your citizen account
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form fields */}
          <motion.div
            className="space-y-4 mb-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            onKeyDown={handleKeyDown}
          >
            {/* Full Name */}
            <motion.div variants={fadeUp} transition={springTransition}>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div variants={fadeUp} transition={springTransition}>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Username */}
            <motion.div variants={fadeUp} transition={springTransition}>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="jane_citizen"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={fadeUp} transition={springTransition}>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={fadeUp} transition={springTransition}>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Create Account button */}
          <motion.div
            variants={fadeUp}
            transition={springTransition}
            className="mb-4"
          >
            <MotionButton
              variant="primary"
              className="w-full py-4 text-base"
              loading={loading}
              onClick={handleSignup}
            >
              Create Account
            </MotionButton>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            transition={springTransition}
            className="flex items-center gap-3 mb-4"
          >
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600 uppercase tracking-wider font-mono">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </motion.div>

          {/* Sign In Instead */}
          <motion.div variants={fadeUp} transition={springTransition}>
            <MotionButton
              variant="secondary"
              className="w-full py-4 text-base"
              onClick={() => router.push("/login")}
            >
              Sign In Instead
            </MotionButton>
          </motion.div>

          {/* Terms & Privacy */}
          <motion.div
            variants={fadeUp}
            transition={springTransition}
            className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-gray-400 hover:text-gray-300 underline underline-offset-2 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-gray-400 hover:text-gray-300 underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>.
            </p>
          </motion.div>

          {/* Back to landing */}
          <motion.div
            variants={fadeUp}
            transition={springTransition}
            className="mt-6 text-center"
          >
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
            >
              ← Back to home
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
