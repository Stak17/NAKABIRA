import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, BookOpen, Calendar, Heart, Shield, FileSpreadsheet, 
  Menu, X, Sparkles, Activity, Clock, LogOut, CheckSquare, Settings, Music,
  Plus, ChevronUp, Zap
} from "lucide-react";

import DiaryApp from "./DiaryApp";
import SchedulerApp from "./SchedulerApp";
import CompanionApp from "./CompanionApp";
import ClinicApp from "./ClinicApp";
import GospelApp from "./GospelApp";

interface DesktopProps {
  masterPassword?: string;
  onLock: () => void;
}

type ActiveAppId = "diary" | "scheduler" | "companion" | "clinic" | "security" | "gospel" | null;

export default function Desktop({ masterPassword, onLock }: DesktopProps) {
  const [activeApp, setActiveApp] = useState<ActiveAppId>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  // Floating action shortcuts
  const [diaryTrigger, setDiaryTrigger] = useState(false);
  const [clinicTrigger, setClinicTrigger] = useState(false);
  const [quickMenuExpanded, setQuickMenuExpanded] = useState(false);

  // Daily prayers content
  const prayers = [
    {
      id: "siblings",
      title: "Prayer for Brother & Sister",
      text: "Heavenly Father, I commit my beloved sister and brother into Your protective hands. Shield them from life's storms, guide their paths, and wrap them in Your infinite love and favor. May our sibling bond remain unbreakable and blessed under Your grace.",
      scripture: "Proverbs 17:17 — 'A brother is born for adversity.'"
    },
    {
      id: "future",
      title: "Prayer for Bright Future & Diligence",
      text: "Lord, bless the work of my hands. Teach me to value hard work, to serve my patients with grace Monday to Saturday, and to run after my goals with tireless integrity. Let my light shine bright and pave the way for a beautiful tomorrow.",
      scripture: "Jeremiah 29:11 — 'Plans to give you hope and a future.'"
    },
    {
      id: "gospel",
      title: "Gospel Serenity Prayer",
      text: "Father, as I listen to gospel music, fill my soul with absolute quietness. Let Your harmony drive out all anxiety from the clinical rushes. Renew my strength so I can soar on wings like eagles, running without growing weary.",
      scripture: "Isaiah 40:31 — 'They shall renew their strength.'"
    }
  ];
  const [activePrayerIndex, setActivePrayerIndex] = useState(0);
  
  // Update taskbar clock
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Action Launchers
  const apps = [
    {
      id: "diary" as const,
      name: "Incharge Secret Vault",
      icon: <Lock className="h-6 w-6 text-purple-400 animate-pulse" />,
      color: "from-purple-500/20 to-indigo-600/10 hover:border-[#8E7AB5]/40",
      desc: "Zero-Knowledge Personal Locker & Audits"
    },
    {
      id: "scheduler" as const,
      name: "Anna Grace Scheduler",
      icon: <Calendar className="h-6 w-6 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-600/10 hover:border-emerald-500/40",
      desc: "Medic Shifts & Devotions"
    },
    {
      id: "companion" as const,
      name: "GraceCompanion AI",
      icon: <Heart className="h-6 w-6 text-amber-400 animate-pulse" />,
      color: "from-amber-500/20 to-amber-600/10 hover:border-amber-500/40",
      desc: "Confidential Devotional Soulmate"
    },
    {
      id: "clinic" as const,
      name: "Clinic Quick-Logger",
      icon: <FileSpreadsheet className="h-6 w-6 text-teal-400" />,
      color: "from-teal-500/20 to-teal-600/10 hover:border-teal-500/40",
      desc: "Secure HIPAA Patient Records"
    },
    {
      id: "gospel" as const,
      name: "Gospel Serenity",
      icon: <Music className="h-6 w-6 text-pink-400 animate-pulse" />,
      color: "from-pink-500/20 to-pink-600/10 hover:border-pink-500/40",
      desc: "Faith-filled Audio Hymns & Praise"
    }
  ];

  const handleAppLaunch = (appId: ActiveAppId) => {
    setActiveApp(appId);
    setStartMenuOpen(false);
    setDiaryTrigger(false);
    setClinicTrigger(false);
  };

  const renderAppContent = () => {
    switch (activeApp) {
      case "diary":
        return <DiaryApp masterPassword={masterPassword} isUnlocked={true} initialCreate={diaryTrigger} />;
      case "scheduler":
        return <SchedulerApp />;
      case "companion":
        return <CompanionApp masterPassword={masterPassword} isUnlocked={true} />;
      case "clinic":
        return <ClinicApp masterPassword={masterPassword} isUnlocked={true} initialCreate={clinicTrigger} />;
      case "gospel":
        return <GospelApp />;
      case "security":
        return (
          <div className="p-6 space-y-4 max-w-md mx-auto text-slate-300">
            <h3 className="font-display font-bold text-lg text-rose-400 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" /> Security Panel
            </h3>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Cryptographic Protocol:</span>
                <span className="font-mono text-emerald-400 font-bold">AES-GCM-256</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Key Derivation:</span>
                <span className="font-mono text-emerald-400 font-bold">PBKDF2-HMAC-SHA256</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>PBKDF2 Iterations:</span>
                <span className="font-mono text-emerald-400 font-bold">100,000 passes</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span>Host Storage:</span>
                <span className="font-mono text-emerald-400 font-bold">HTML5 Secured LocalDisk</span>
              </div>
              <div className="flex justify-between">
                <span>Lock State:</span>
                <span className="font-mono text-emerald-400 font-bold">Master Password Sealing</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed text-center">
              JoJo OS uses military-grade, client-side encryption. The password you entered on login generates a unique cryptographic secret key in memory. Your diaries, AI chats, and patient records are encrypted before writing. Even if anyone duplicates your disk, your secrets remain mathematically impenetrable.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative h-screen w-screen bg-[#0D0F12] flex flex-col justify-between overflow-hidden text-[#E0E0E0] font-sans">
      
      {/* Dynamic Ambient Background - Artistic Flair lavender/sky blue tones */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-20 h-96 w-96 rounded-full bg-[#8E7AB5]/15 blur-[120px] ambient-blob-1" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-[#B4D4FF]/15 blur-[120px] ambient-blob-2" />
        <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-white/[0.01] blur-[100px] ambient-blob-3" />
      </div>

      {/* Subtle STAK TECH background watermark */}
      <div className="absolute bottom-24 left-8 z-0 select-none pointer-events-none opacity-[0.06] hover:opacity-[0.15] transition-opacity duration-300">
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase leading-none">Designed & Engineered by</p>
        <p className="font-sans font-black text-xl tracking-[0.25em] mt-1.5 text-white/90">STAK TECH</p>
      </div>

      {/* Desktop Header Panel - Artistic Flair Top Nav */}
      <header className="relative z-10 glass-header px-6 py-4 flex justify-between items-center text-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] flex items-center justify-center text-black font-sans font-bold text-lg shadow-lg shrink-0">
            J
          </div>
          <div>
            <h1 className="text-xs tracking-[0.3em] uppercase font-semibold opacity-60">JoJo OS v1.0</h1>
            <p className="text-sm font-light text-white">Musawo Joan</p>
          </div>
        </div>
        
        {/* Quick status tray & Clock */}
        <div className="flex gap-8 text-right items-center">
          <div className="hidden md:block text-left">
            <p className="text-[9px] uppercase opacity-40 tracking-widest leading-none">Status</p>
            <p className="text-xs text-[#4ADE80] font-mono mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
              Encrypted Tunnel Active
            </p>
          </div>
          <div className="hidden sm:block text-left pl-4 border-l border-white/10">
            <p className="text-[9px] uppercase opacity-40 tracking-widest leading-none">Affiliation</p>
            <p className="text-xs text-white/70 mt-1">Anna Grace Medical Center</p>
          </div>
          <div className="pl-4 border-l border-white/10 text-right">
            <p className="text-xl md:text-2xl font-light tracking-tighter text-white">
              {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>
            <p className="text-[8px] uppercase opacity-40 tracking-widest">
              {dateTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      {/* Main Desktop Space */}
      <main className="relative z-10 flex-1 p-6 md:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* Desktop Widgets / Layout (visible when no app is open) */}
        <AnimatePresence>
          {!activeApp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
            >
              {/* LEFT COLUMN: DEVOTION & PRINCIPLES (The Prayerful Side) */}
              <div className="col-span-12 md:col-span-4 flex flex-col gap-6 justify-between">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-[#8E7AB5]/20 text-[#B4D4FF] text-[9px] uppercase tracking-widest rounded-full border border-[#8E7AB5]/30 inline-block">Daily Devotion</span>
                    <h2 className="text-2xl font-serif italic text-white/90 leading-tight">"He leads me beside quiet waters, He refreshes my soul."</h2>
                    <p className="text-xs opacity-50 font-serif">Psalm 23:2-3</p>
                  </div>
                  <div className="pt-4 border-t border-white/10 mt-6">
                    <p className="text-[9px] uppercase tracking-widest opacity-40 mb-1">Joan's Creed</p>
                    <p className="text-xs italic opacity-80 uppercase leading-relaxed tracking-wider">Principled. Simple. Unshakable.</p>
                  </div>
                </div>
                
                <div className="bg-[#1A1D23] rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest opacity-40">Next Duty Shift</p>
                    <p className="text-lg font-light mt-1 text-[#B4D4FF]">Thursday Night</p>
                    <p className="text-xs opacity-50">20:00 - 08:00 (Friday)</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 opacity-40 text-[#8E7AB5]" />
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: THE VAULT (Secretive & Minimal Launcher) */}
              <div className="col-span-12 md:col-span-4 flex flex-col">
                <div className="flex-1 bg-gradient-to-b from-[#121417] to-[#0A0C0E] rounded-[3rem] border border-white/10 p-6 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-5">
                    <div className="w-36 h-36 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                      <div className="w-26 h-26 rounded-full bg-[#1A1D23] border border-white/10 flex items-center justify-center shadow-2xl relative">
                         <Lock className="w-9 h-9 text-[#B4D4FF] opacity-80" />
                         <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#4ADE80] rounded-full shadow-[0_0_12px_rgba(74,222,128,0.6)]"></div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-light tracking-[0.2em] uppercase mb-1 text-white">JoJo Vault</h3>
                  <p className="text-[9px] text-[#B4D4FF]/60 uppercase tracking-[0.3em] font-mono">AES-256 Encryption Secure</p>
                  
                  {/* Grid of Launcher Icons mapped to actual apps */}
                  <div className="mt-6 grid grid-cols-2 gap-2.5 w-full">
                    {apps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => handleAppLaunch(app.id)}
                        className="flex flex-col items-start gap-2 p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.07] hover:border-[#8E7AB5]/30 transition-all duration-300 text-left cursor-pointer group"
                      >
                        <div className="p-1.5 bg-[#1A1D23] rounded-lg border border-white/10 group-hover:scale-105 transition-transform text-[#B4D4FF]">
                          {React.cloneElement(app.icon, { className: "h-4.5 w-4.5" })}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-white/95">{app.name}</h4>
                          <p className="text-[9px] text-white/40 mt-0.5 leading-tight">{app.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DAILY PRAYER CARD & SHORTCUTS */}
              <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                
                {/* Daily Prayer Card */}
                <div className="flex-1 bg-gradient-to-br from-[#1A1D23] to-[#121417] rounded-[3rem] border border-[#8E7AB5]/25 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shadow-lg min-h-[280px]">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#8E7AB5]/10 blur-2xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-[#8E7AB5]/20 text-[#B4D4FF] text-[9px] uppercase tracking-widest rounded-full border border-[#8E7AB5]/30 font-semibold">
                        Daily Prayer
                      </span>
                      <div className="flex gap-1">
                        {prayers.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActivePrayerIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i === activePrayerIndex ? "bg-[#B4D4FF] w-3.5" : "bg-white/20 hover:bg-white/40"
                            }`}
                            title={`Prayer ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#B4D4FF] animate-pulse" />
                        {prayers[activePrayerIndex].title}
                      </h4>
                      <p className="text-xs text-[#E0E0E0]/85 leading-relaxed italic font-serif min-h-[110px] flex items-center bg-white/[0.01] p-3 rounded-2xl border border-white/[0.03]">
                        "{prayers[activePrayerIndex].text}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                    <span className="text-[10px] text-[#B4D4FF]/80 font-serif italic max-w-[70%]">
                      {prayers[activePrayerIndex].scripture}
                    </span>
                    <button
                      onClick={() => setActivePrayerIndex((prev) => (prev + 1) % prayers.length)}
                      className="text-[10px] text-white/50 hover:text-[#B4D4FF] transition-all font-semibold uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Shift Roster & Reminders Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-widest opacity-40 mb-2">Shift Roster</p>
                    <div className="text-[10px] space-y-1 text-white/75">
                      <div className="flex justify-between">
                        <span>Ward Rounds:</span>
                        <span className="text-[#B4D4FF] font-mono">08:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consults:</span>
                        <span className="text-[#B4D4FF] font-mono">10:30</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-[#B4D4FF]/5 border border-[#B4D4FF]/10 flex flex-col justify-center">
                    <p className="text-[9px] uppercase tracking-widest text-[#B4D4FF] mb-2">Next Devotion</p>
                    <p className="text-[10px] text-white/85 font-semibold">Morning Devotion</p>
                    <p className="text-[9px] text-white/40">Psalm 23 Meditations</p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE APP FLOATING WINDOW (RESPONSIVE) */}
        <AnimatePresence>
          {activeApp && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ type: "spring", damping: 25 }}
              className="flex-1 glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden max-w-5xl mx-auto w-full"
            >
              {/* Window Titlebar */}
              <div className="flex justify-between items-center px-4 py-3 bg-[#121417]/90 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-[#0D0F12] rounded border border-white/5">
                    {activeApp === "diary" && <BookOpen className="h-3.5 w-3.5 text-rose-400" />}
                    {activeApp === "scheduler" && <Calendar className="h-3.5 w-3.5 text-emerald-400" />}
                    {activeApp === "companion" && <Heart className="h-3.5 w-3.5 text-amber-400 animate-pulse" />}
                    {activeApp === "clinic" && <FileSpreadsheet className="h-3.5 w-3.5 text-teal-400" />}
                    {activeApp === "gospel" && <Music className="h-3.5 w-3.5 text-pink-400 animate-pulse" />}
                    {activeApp === "security" && <Settings className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
                  <span className="font-sans font-semibold text-xs sm:text-sm text-white/90 tracking-wide">
                    {activeApp === "diary" && "Incharge Secret Vault"}
                    {activeApp === "scheduler" && "Anna Grace Scheduler & Devotion Tracker"}
                    {activeApp === "companion" && "GraceCompanion • Secure AI Advisor"}
                    {activeApp === "clinic" && "Anna Grace Patient Ledger & Chores"}
                    {activeApp === "gospel" && "Gospel Serenity • Hymns & Praise Player"}
                    {activeApp === "security" && "JoJo OS Client-Side Cryptographic System"}
                  </span>
                </div>

                {/* Window Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveApp("security")}
                    title="Security Metrics"
                    className="p-1.5 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5 text-[#4ADE80]" />
                  </button>
                  <button
                    onClick={() => setActiveApp(null)}
                    title="Close App"
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-400 transition cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* App Content viewport */}
              <div className="flex-1 bg-[#0D0F12]/40 overflow-hidden">
                {renderAppContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Start Menu Drawer Overlay */}
      <AnimatePresence>
        {startMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setStartMenuOpen(false)}
          >
            {/* Start Menu Box */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-16 left-4 z-50 w-80 glass-panel rounded-2xl border border-white/10 overflow-hidden p-4 shadow-2xl flex flex-col space-y-4 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Musawo Monogram Profile Header */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] flex items-center justify-center text-black font-sans font-extrabold text-sm shadow-md shrink-0">
                  MJ
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-white">Musawo Joan</h3>
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider block mt-0.5">
                    Clinician & Prayer Warrior
                  </span>
                </div>
              </div>

              {/* Identity details list */}
              <div className="space-y-1.5 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Affiliation:</span>
                  <span className="text-white">Anna Grace Medical Center</span>
                </div>
                <div className="flex justify-between">
                  <span>Routine:</span>
                  <span className="text-white">Monday - Saturday (Full Duty)</span>
                </div>
                <div className="flex justify-between">
                  <span>Duty Shifts:</span>
                  <span className="text-[#B4D4FF] font-semibold">Thursday Night - Friday Night</span>
                </div>
                <div className="flex justify-between">
                  <span>Personality Vibe:</span>
                  <span className="text-[#8E7AB5] font-semibold">Beautiful but Stubborn & Secretive 🤫</span>
                </div>
              </div>

              {/* Dedicated App shortcuts */}
              <div className="border-t border-white/10 pt-3 space-y-1">
                <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono block mb-1">OS APPLICATIONS</span>
                {apps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAppLaunch(app.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <div className="p-1 bg-[#0D0F12] rounded border border-white/5 text-[#B4D4FF]">
                      {app.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white">{app.name}</h4>
                    </div>
                  </button>
                ))}
              </div>

              {/* Start Menu Footer with Log Out */}
              <div className="border-t border-white/10 pt-3.5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleAppLaunch("security")}
                    className="flex items-center gap-1 text-white/40 hover:text-[#B4D4FF] text-xs transition cursor-pointer"
                  >
                    <Shield className="h-3.5 w-3.5" /> Security Panel
                  </button>
                  
                  <button
                    onClick={onLock}
                    className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Lock OS
                  </button>
                </div>
                <div className="text-[9px] text-center text-white/20 font-mono tracking-widest border-t border-white/5 pt-2">
                  DEVELOPED BY <span className="text-[#B4D4FF] font-semibold">STAK TECH</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Taskbar (at the absolute bottom) */}
      <footer className="relative z-10 bg-[#0D0F12]/95 border-t border-white/10 px-4 py-2 flex justify-between items-center text-xs h-14">
        
        {/* Start Button & Shortcuts */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`p-2 rounded-xl transition duration-300 flex items-center justify-center cursor-pointer ${
              startMenuOpen 
                ? "bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] text-black shadow-md" 
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-[#B4D4FF]"
            }`}
            title="JoJo Start Menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          
          <span className="text-white/20 font-mono">|</span>

          {/* Quick Shortcuts */}
          <div className="hidden sm:flex items-center gap-1.5">
            {apps.map(app => {
              const isOpen = activeApp === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => handleAppLaunch(app.id)}
                  className={`p-1.5 px-3.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                    isOpen
                      ? "bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 border-[#B4D4FF]/30 text-white"
                      : "bg-[#0D0F12] hover:bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {React.cloneElement(app.icon, { className: "h-3.5 w-3.5" })}
                  <span>{app.name.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Application tab indicator (mobile-friendly display helper) */}
        {activeApp && (
          <div className="sm:hidden text-[#B4D4FF] text-[11px] font-medium bg-white/5 p-1.5 px-3 rounded-lg border border-white/10">
            Active: {activeApp.toUpperCase()}
          </div>
        )}

        {/* Taskbar Clock & Date Tray */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:flex flex-col text-[9px] text-white/30 leading-tight border-r border-white/10 pr-3 mr-1 text-left">
            <span>OS Build: v1.0</span>
            <span>By <span className="text-[#B4D4FF]/70 font-semibold">STAK TECH</span></span>
          </div>
          <div className="hidden sm:flex flex-col text-[10px] text-white/40 leading-tight">
            <span>KEY: Derived</span>
            <span className="text-[#4ADE80] font-mono font-semibold">SECURE (AES)</span>
          </div>
          <span className="text-white/20 font-mono hidden sm:inline">|</span>
          <div className="flex items-center gap-2 bg-[#0D0F12] border border-white/10 rounded-xl px-3 py-1 text-white/80 font-mono text-xs shadow-inner">
            <Clock className="h-3.5 w-3.5 text-white/40" />
            <span>
              {dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Quick-Access Menu */}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-2.5">
        
        {/* Expanded Quick Actions Panel */}
        <AnimatePresence>
          {quickMenuExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-[#121417]/95 border border-white/10 backdrop-blur-md rounded-2xl p-2.5 shadow-2xl flex flex-col gap-2 relative border-[#8E7AB5]/25 shadow-[0_15px_30px_rgba(142,122,181,0.2)]"
            >
              {/* Subtle breathing accent glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 rounded-2xl opacity-100 -z-10 blur-sm animate-pulse" />
              
              <div className="text-[9px] text-[#B4D4FF] uppercase tracking-widest font-mono font-bold px-1.5 pb-1.5 border-b border-white/5 text-center flex items-center justify-center gap-1">
                <Zap className="w-2.5 h-2.5 text-[#8E7AB5]" />
                Quick Actions
              </div>
              
              <button
                onClick={() => {
                  setActiveApp("diary");
                  setDiaryTrigger(true);
                  setClinicTrigger(false);
                  setQuickMenuExpanded(false); // Collapse on action
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-[#8E7AB5]/10 border border-[#8E7AB5]/20 hover:bg-[#8E7AB5]/25 hover:border-[#8E7AB5]/40 text-white transition-all duration-200 cursor-pointer w-36 text-left group"
              >
                <span className="p-1 rounded bg-[#8E7AB5]/20 text-[#B4D4FF] group-hover:scale-110 transition-all">
                  <BookOpen className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold text-slate-100">Add Entry</span>
              </button>
              
              <button
                onClick={() => {
                  setActiveApp("clinic");
                  setClinicTrigger(true);
                  setDiaryTrigger(false);
                  setQuickMenuExpanded(false); // Collapse on action
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/25 hover:border-teal-500/40 text-white transition-all duration-200 cursor-pointer w-36 text-left group"
              >
                <span className="p-1 rounded bg-teal-500/20 text-teal-300 group-hover:scale-110 transition-all">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold text-slate-100">New Log</span>
              </button>
              
              <button
                onClick={() => {
                  onLock();
                  setQuickMenuExpanded(false); // Collapse on action
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs bg-red-950/40 border border-red-500/30 hover:bg-red-900/30 hover:border-red-500/50 text-red-300 transition-all duration-200 cursor-pointer w-36 text-left group shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <span className="p-1 rounded bg-red-500/25 text-red-400 group-hover:scale-110 transition-all">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold">Panic Lock</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Trigger Floating Action Button */}
        <motion.button
          onClick={() => setQuickMenuExpanded(!quickMenuExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs shadow-2xl border backdrop-blur-md transition-all duration-300 cursor-pointer ${
            quickMenuExpanded 
              ? "bg-[#8E7AB5] border-[#8E7AB5]/40 text-black font-bold shadow-[#8E7AB5]/30" 
              : "bg-[#121417]/90 border-white/10 hover:border-[#8E7AB5]/40 text-white shadow-black/50"
          }`}
        >
          <div className="relative flex items-center justify-center">
            {quickMenuExpanded ? (
              <X className="w-4 h-4 text-black transition-transform duration-300 rotate-90" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#B4D4FF] animate-pulse" />
                {/* Tiny notification-dot to draw attention */}
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-pink-500" />
              </>
            )}
          </div>
          <span className={`font-sans tracking-wider uppercase text-[10px] font-extrabold ${quickMenuExpanded ? "text-black" : "text-[#B4D4FF]"}`}>
            {quickMenuExpanded ? "Close" : "Quick Actions"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
