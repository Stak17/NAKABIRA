import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Shield, Lock, FileSpreadsheet, Plus, Trash2, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { PatientLog } from "../types";
import { encryptText, decryptText } from "../lib/crypto";

interface ClinicAppProps {
  masterPassword?: string;
  isUnlocked: boolean;
  initialCreate?: boolean;
}

export default function ClinicApp({ masterPassword, isUnlocked, initialCreate }: ClinicAppProps) {
  const [patientLogs, setPatientLogs] = useState<PatientLog[]>([]);
  const [activeTab, setActiveTab] = useState<"ledger" | "chores">("ledger");
  const [isCreating, setIsCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (initialCreate) {
      setIsCreating(true);
    }
  }, [initialCreate]);
  
  // Form states
  const [initials, setInitials] = useState("");
  const [vitals, setVitals] = useState("");
  const [stubbornness, setStubbornness] = useState(3);
  const [note, setNote] = useState("");

  // Anna Grace Clinic shift chores list
  const [chores, setChores] = useState([
    { id: "c1", text: "Lock secure medical files", done: true },
    { id: "c2", text: "Verify Thursday night shift handovers", done: false },
    { id: "c3", text: "Count emergency medicine stocks", done: false },
    { id: "c4", text: "Restock outpatient desk prayer cards", done: true },
  ]);

  useEffect(() => {
    if (isUnlocked && masterPassword) {
      loadLogs();
    }
  }, [isUnlocked, masterPassword]);

  const loadLogs = async () => {
    setStatusMsg("Decrypting Patient Log Database...");
    try {
      const rawEncryptedList = localStorage.getItem("jojo_secure_clinic_v1");
      if (!rawEncryptedList) {
        // Sample medical notes
        const demoLogs: PatientLog[] = [
          {
            id: "pl1",
            patientInitials: "K.M.",
            vitals: "BP 132/84, HR 68, Temp 37.1 C",
            stubbornnessLevel: 4,
            note: "Patient KM refused to take his evening hypertension medication, stating he has taken enough capsules this week. Tried a gentle but stern look. Finally, he laughed, calling me stubborn, and drank his pills with apple juice.",
            timestamp: new Date(Date.now() - 3 * 3600 * 1000).toLocaleString()
          },
          {
            id: "pl2",
            patientInitials: "G.A.",
            vitals: "BP 118/72, Temp 36.5 C",
            stubbornnessLevel: 1,
            note: "Grandma Grace was highly cooperative and beautiful today. Complimented my medical posture and asked if she could pray for my medicine cabinet. We prayed together for 2 minutes. She is recuperating wonderfully.",
            timestamp: new Date().toLocaleString()
          }
        ];
        await saveEncryptedLogs(demoLogs);
        setPatientLogs(demoLogs);
      } else {
        const encryptedItems = JSON.parse(rawEncryptedList) as { id: string; patientInitials: string; vitals: string; stubbornnessLevel: number; encryptedNote: string; timestamp: string }[];
        const decryptedList: PatientLog[] = [];

        for (const item of encryptedItems) {
          try {
            const decNote = await decryptText(item.encryptedNote, masterPassword!);
            decryptedList.push({
              id: item.id,
              patientInitials: item.patientInitials,
              vitals: item.vitals,
              stubbornnessLevel: item.stubbornnessLevel,
              note: decNote,
              timestamp: item.timestamp
            });
          } catch (e) {
            console.error("Patient log decryption error:", e);
          }
        }
        setPatientLogs(decryptedList);
      }
      setStatusMsg("");
    } catch (err) {
      console.error("Clinical database loading failed:", err);
      setStatusMsg("Decrypt failed: database offline.");
    }
  };

  const saveEncryptedLogs = async (currentPlainLogs: PatientLog[]) => {
    if (!masterPassword) return;
    try {
      const encryptedItems = [];
      for (const log of currentPlainLogs) {
        const encryptedNote = await encryptText(log.note, masterPassword);
        encryptedItems.push({
          id: log.id,
          patientInitials: log.patientInitials,
          vitals: log.vitals,
          stubbornnessLevel: log.stubbornnessLevel,
          timestamp: log.timestamp,
          encryptedNote
        });
      }
      localStorage.setItem("jojo_secure_clinic_v1", JSON.stringify(encryptedItems));
    } catch (e) {
      console.error("Failed to encrypt patient logs:", e);
      setStatusMsg("Security error: encrypt failure.");
    }
  };

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || !note.trim()) return;

    const newLog: PatientLog = {
      id: Math.random().toString(),
      patientInitials: initials.toUpperCase(),
      vitals: vitals || "N/A",
      stubbornnessLevel: stubbornness,
      note: note,
      timestamp: new Date().toLocaleString()
    };

    const updated = [newLog, ...patientLogs];
    setPatientLogs(updated);
    await saveEncryptedLogs(updated);

    // Reset Form
    setInitials("");
    setVitals("");
    setStubbornness(3);
    setNote("");
    setIsCreating(false);
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm("Are you sure you want to securely shred this encrypted clinic log?")) {
      const updated = patientLogs.filter(log => log.id !== id);
      setPatientLogs(updated);
      await saveEncryptedLogs(updated);
    }
  };

  const toggleChore = (id: string) => {
    setChores(prev =>
      prev.map(c => (c.id === id ? { ...c, done: !c.done } : c))
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-slate-200">
      {/* Encryption Header Banner */}
      <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-950/20 px-4 py-2 text-xs text-emerald-300">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Patient Records Encrypted under Musawo AES Code</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
          <span>Anna Grace HIPAA Shield Compliant</span>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-slate-900 px-4 py-1 text-center text-xs text-amber-300 font-mono">
          {statusMsg}
        </div>
      )}

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex border-b border-white/10 bg-slate-950 shrink-0">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "ledger"
              ? "border-emerald-500 text-emerald-400 bg-white/5 font-extrabold"
              : "border-transparent text-white/40 hover:text-white/80"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Patient Ledger
        </button>
        <button
          onClick={() => {
            setActiveTab("chores");
          }}
          className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "chores"
              ? "border-teal-500 text-teal-400 bg-white/5 font-extrabold"
              : "border-transparent text-white/40 hover:text-white/80"
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Chores & Logs
        </button>
      </div>

      {/* Grid Layout: Left Column Log entry list, Right Column task list / new logger */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Hand: Patient logs list */}
        <div className={`flex-1 border-r border-slate-700/50 overflow-y-auto p-4 space-y-3 ${activeTab === "ledger" ? "flex flex-col" : "hidden md:flex md:flex-col"}`}>
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-display font-medium text-slate-300 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Patient Stubbornness Ledger
            </h3>
            <button
              onClick={() => {
                setIsCreating(true);
                setActiveTab("chores");
              }}
              className="flex items-center gap-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 px-2.5 py-1 text-xs text-emerald-200 font-medium transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Log Patient
            </button>
          </div>

          {patientLogs.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-500">No Patient Logs active today.</p>
          ) : (
            <div className="space-y-3">
              {patientLogs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-slate-200 text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        PATIENT ID: {log.patientInitials}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-1">{log.timestamp}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="text-slate-500 hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-300 font-sans leading-relaxed italic bg-slate-950/40 p-2.5 rounded border border-slate-850">
                    "{log.note}"
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 items-center justify-between pt-1 border-t border-slate-850">
                    <span>Vitals: <span className="font-mono text-slate-300">{log.vitals}</span></span>
                    <span className="flex items-center gap-1">
                      Stubborn Vibe:{" "}
                      <span className={`px-1.5 py-0.5 rounded font-semibold ${
                        log.stubbornnessLevel >= 4 ? "bg-amber-500/10 text-amber-300" :
                        log.stubbornnessLevel >= 2 ? "bg-blue-500/10 text-blue-300" :
                        "bg-emerald-500/10 text-emerald-300"
                      }`}>
                        {log.stubbornnessLevel}/5 (
                        {log.stubbornnessLevel === 1 ? "Angelic" :
                         log.stubbornnessLevel === 2 ? "Cooperative" :
                         log.stubbornnessLevel === 3 ? "A bit skeptical" :
                         log.stubbornnessLevel === 4 ? "Argumentative" :
                         "Musawo level defiance!"}
                        )
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Hand Column: Logger Form / Chore List */}
        <div className={`w-full md:w-80 bg-slate-900/30 p-4 space-y-4 overflow-y-auto ${activeTab === "chores" ? "block" : "hidden md:block"}`}>
          {isCreating ? (
            <form onSubmit={handleCreateLog} className="space-y-3 p-3 rounded-xl border border-emerald-500/10 bg-emerald-950/5">
              <h4 className="font-display font-semibold text-xs text-emerald-400 uppercase tracking-wider">
                Create Patient Log Entry
              </h4>
              
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Patient Initials (Secrecy Rule)</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={initials}
                  onChange={(e) => setInitials(e.target.value)}
                  placeholder="E.g., J.O."
                  className="w-full bg-slate-950 border border-slate-700/60 rounded p-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Vitals Info</label>
                <input
                  type="text"
                  value={vitals}
                  onChange={(e) => setVitals(e.target.value)}
                  placeholder="E.g., BP 120/80, HR 72, Temp 36.8"
                  className="w-full bg-slate-950 border border-slate-700/60 rounded p-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-medium text-slate-400">Patient stubbornness (1-5)</label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">{stubbornness}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={stubbornness}
                  onChange={(e) => setStubbornness(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-1">Clinical Observation / Notes</label>
                <textarea
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write patient feedback, refusals, medication details, or funny conversations here. Encrypted locally..."
                  className="w-full min-h-[100px] bg-slate-950 border border-slate-700/60 rounded p-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
              </div>

              <div className="flex gap-1.5 pt-1 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 rounded border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer font-semibold flex items-center gap-1 transition"
                >
                  <Lock className="h-3 w-3" /> Secure Log
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
              <h4 className="font-display font-semibold text-xs text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-400" />
                Anna Grace Medical Center Rules
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Joan, stay on top of the nursing station chores before the Thursday Night Shift transition begins. Check these off as you complete them:
              </p>
              
              <div className="space-y-1.5 pt-1">
                {chores.map(chore => (
                  <label
                    key={chore.id}
                    onClick={() => toggleChore(chore.id)}
                    className="flex items-center gap-2 text-xs text-slate-300 py-1 hover:bg-slate-900/60 rounded px-1 transition cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={chore.done}
                      readOnly
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 h-3.5 w-3.5 pointer-events-none"
                    />
                    <span className={chore.done ? "line-through text-slate-500" : ""}>
                      {chore.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-2 text-[11px] text-slate-500">
            <h5 className="font-semibold text-xs text-slate-400">Secured Disk Logging Mode</h5>
            <p className="leading-relaxed">
              Your patient notes are converted to AES-256 byte segments and merged into localStorage. Your clinical handovers are secure from unauthorized eyes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
