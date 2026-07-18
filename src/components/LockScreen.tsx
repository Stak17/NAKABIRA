import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Sparkles, ShieldCheck, ShieldAlert, KeyRound, ArrowRight, UserCheck } from "lucide-react";
import { verifyMasterPassword, createPasswordCheckPayload } from "../lib/crypto";

interface LockScreenProps {
  onUnlock: (password: string) => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [isProvisioned, setIsProvisioned] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [greeting, setGreeting] = useState("");

  // Provisioning state (First time setup)
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);

  useEffect(() => {
    // Check if the master check payload exists in localStorage
    const checkPayload = localStorage.getItem("jojo_os_check_v1");
    if (checkPayload) {
      setIsProvisioned(true);
    }

    // Dynamic greeting based on time of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning, Musawo Joan ☀️");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon, Musawo Joan 🩺");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening, Musawo Joan 🌿");
    } else {
      setGreeting("Quiet Night Shift Companion, Musawo Joan 🌌");
    }
  }, []);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setErrorMsg("");
    const checkPayload = localStorage.getItem("jojo_os_check_v1");
    
    if (checkPayload) {
      const isValid = await verifyMasterPassword(password, checkPayload);
      if (isValid) {
        onUnlock(password);
      } else {
        setErrorMsg("Access Denied, Joan! Being stubborn with your password today? Try again, beautiful.");
      }
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    setErrorMsg("");
    if (password.length < 4) {
      setErrorMsg("Password must be at least 4 characters for strong AES key generation.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Stand by your principles, but match your keys!");
      return;
    }

    setIsProvisioning(true);
    try {
      const payload = await createPasswordCheckPayload(password);
      localStorage.setItem("jojo_os_check_v1", payload);
      setIsProvisioned(true);
      onUnlock(password);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to provision your client cryptographic environment.");
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#0D0F12] overflow-hidden font-sans select-none">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -left-40 h-[450px] w-[450px] rounded-full bg-[#8E7AB5]/15 blur-[120px] ambient-blob-1" />
        <div className="absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-[#B4D4FF]/15 blur-[120px] ambient-blob-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-white/[0.02] blur-[80px] ambient-blob-3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Glassmorphic Panel Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center">
          
          {/* Logo Badge */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] opacity-15 animate-pulse border border-white/15" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] flex items-center justify-center text-black font-sans font-extrabold text-xl shadow-lg relative z-10">
              J
            </div>
          </div>

          <h1 className="font-sans font-light text-xl tracking-[0.25em] uppercase text-white mb-1">
            JoJo OS
          </h1>
          <p className="text-[9px] text-[#B4D4FF]/60 font-mono uppercase tracking-[0.3em] mb-6">
            Secure Cryptographic Environment
          </p>

          <AnimatePresence mode="wait">
            {!isProvisioned ? (
              /* PROVISIONING FORM (First Run) */
              <motion.form
                key="provision"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleProvisionSubmit}
                className="w-full space-y-4"
              >
                <div className="bg-[#8E7AB5]/10 border border-[#8E7AB5]/20 rounded-2xl p-4 text-xs text-[#B4D4FF] leading-relaxed text-center">
                  <UserCheck className="h-4.5 w-4.5 text-[#B4D4FF] mx-auto mb-1.5" />
                  <p className="font-semibold text-white/90">Welcome, Musawo Joan 🩺</p>
                  <p className="text-[10.5px] text-white/60 mt-1">
                    Your secretive nature is fully respected here. Create a Master Password now to spin up your zero-knowledge client-side AES vault.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-medium text-white/50 block uppercase tracking-wider">Create Security Phrase</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 pl-9 text-white text-xs focus:outline-none focus:border-[#B4D4FF] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-medium text-white/50 block uppercase tracking-wider">Confirm Security Phrase</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 pl-9 text-white text-xs focus:outline-none focus:border-[#B4D4FF] transition-all"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-1.5 text-amber-200 text-[11px] bg-amber-950/20 border border-amber-500/10 p-2.5 rounded-lg text-center justify-center">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold transition duration-300 cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-black/40"
                >
                  {isProvisioning ? "Sealing Storage..." : "Create Secure Crypt Key"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.form>
            ) : (
              /* STANDARD UNLOCK FORM */
              <motion.form
                key="unlock"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleUnlockSubmit}
                className="w-full space-y-4"
              >
                <div className="text-center space-y-1 mb-2">
                  <h2 className="font-serif font-semibold italic text-base text-white/90">{greeting}</h2>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    Dedicated to Musawo Joan • Anna Grace Center
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                    <input
                      type="password"
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Master Password to unseal..."
                      className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 pl-9 text-white text-xs focus:outline-none focus:border-[#8E7AB5] transition-all"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-1.5 text-rose-300 text-[11px] bg-rose-950/20 border border-rose-500/10 p-2.5 rounded-lg text-center justify-center">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold transition duration-300 cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-black/40"
                >
                  Unseal Environment
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                
                <div className="text-center">
                  <span className="text-[10px] text-white/40 font-mono flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#4ADE80]" /> Zero-Knowledge Offline Privacy Active
                  </span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        {/* Humble and beautiful footer credits */}
        <p className="text-center text-[10px] text-white/30 mt-6 font-mono tracking-widest">
          JOJO OS V1.0 • CRAFTED WITH LOVE FOR JOAN
        </p>
      </motion.div>
    </div>
  );
}
