import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Shield, Lock, Eye, EyeOff, Plus, Trash2, Calendar, FileText, LockKeyhole,
  KeyRound, Users, Copy, Check, Download, Upload, ShieldCheck, Activity, RefreshCw, 
  AlertTriangle, Search, Star, Info, Settings, ShieldAlert, Sparkles, LogOut
} from "lucide-react";
import { DiaryEntry, VaultCredential, StaffLog } from "../types";
import { encryptText, decryptText, verifyMasterPassword, createPasswordCheckPayload } from "../lib/crypto";

interface DiaryAppProps {
  masterPassword?: string;
  isUnlocked: boolean;
  initialCreate?: boolean;
}

type SubTabId = "diary" | "credentials" | "staff" | "security";

export default function DiaryApp({ masterPassword, isUnlocked, initialCreate }: DiaryAppProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("diary");
  const [statusMsg, setStatusMsg] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // Vault Lock State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultUnlockInput, setVaultUnlockInput] = useState("");
  const [vaultUnlockError, setVaultUnlockError] = useState("");
  const [revealUnlockPass, setRevealUnlockPass] = useState(false);

  // Change password form state in Vault Security
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");

  // 1. Diary entries state
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [diarySearch, setDiarySearch] = useState("");
  
  // Diary entry form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newMood, setNewMood] = useState<DiaryEntry["mood"]>("Peaceful");
  const [newCategory, setNewCategory] = useState<DiaryEntry["category"]>("Personal");
  const [isDecryptingDiary, setIsDecryptingDiary] = useState(false);

  useEffect(() => {
    if (initialCreate) {
      setIsCreatingEntry(true);
      setActiveSubTab("diary");
    }
  }, [initialCreate]);

  // 2. Credentials state
  const [credentials, setCredentials] = useState<VaultCredential[]>([]);
  const [selectedCred, setSelectedCred] = useState<VaultCredential | null>(null);
  const [isCreatingCred, setIsCreatingCred] = useState(false);
  const [credSearch, setCredSearch] = useState("");
  
  // Credentials form state
  const [credLabel, setCredLabel] = useState("");
  const [credUsername, setCredUsername] = useState("");
  const [credSecret, setCredSecret] = useState("");
  const [credNotes, setCredNotes] = useState("");
  const [credCategory, setCredCategory] = useState<VaultCredential["category"]>("Lock Code");
  
  // Password Generator state
  const [genLength, setGenLength] = useState(12);
  const [genIncludeSymbols, setGenIncludeSymbols] = useState(true);
  const [genIncludeNumbers, setGenIncludeNumbers] = useState(true);

  // 3. Staff logs state
  const [staffLogs, setStaffLogs] = useState<StaffLog[]>([]);
  const [selectedStaffLog, setSelectedStaffLog] = useState<StaffLog | null>(null);
  const [isCreatingStaffLog, setIsCreatingStaffLog] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  
  // Staff log form state
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState<StaffLog["role"]>("Nurse");
  const [staffChoreStatus, setStaffChoreStatus] = useState<StaffLog["choreStatus"]>("Completed");
  const [staffPerformance, setStaffPerformance] = useState(5);
  const [staffRemarks, setStaffRemarks] = useState("");

  // 4. Security & Diagnostics state
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed vault check payload on mount if none exists yet and masterPassword is available
  useEffect(() => {
    if (isUnlocked && masterPassword) {
      const checkPayload = localStorage.getItem("jojo_vault_password_check");
      if (!checkPayload) {
        createPasswordCheckPayload(masterPassword).then(payload => {
          localStorage.setItem("jojo_vault_password_check", payload);
        }).catch(err => console.error("Failed to seed vault check payload:", err));
      }
    }
  }, [isUnlocked, masterPassword]);

  const loadAllSecureData = async (passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword;
    if (!pw) return;
    setIsDecryptingDiary(true);
    setStatusMsg("Deriving client-side keys & unsealing all secure vaults...");
    try {
      await Promise.all([
        loadDiaryEntries(pw),
        loadCredentials(pw),
        loadStaffLogs(pw)
      ]);
      setStatusMsg("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Global Decryption Error. Please lock and unlock the OS or check your vault passphrase.");
    } finally {
      setIsDecryptingDiary(false);
    }
  };

  // --- DIARY CRYPTO LOGIC ---
  const loadDiaryEntries = async (passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    const rawEncryptedList = localStorage.getItem("jojo_secure_diary_v1");
    if (!rawEncryptedList) {
      const demoEntries: DiaryEntry[] = [
        {
          id: "d1",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
          title: "Midnight Shift Musings",
          content: "Tonight is Friday, finishing up the heavy night shift at Anna Grace Medical Center. I am exhausted but filled with gratitude. We admitted a tiny baby who is now resting peacefully. I sometimes keep my worries to myself, but in the quiet of the night, I lay them all at the feet of Jesus.",
          mood: "Exhausted",
          category: "Medic Devotion"
        },
        {
          id: "d2",
          date: new Date().toLocaleDateString(),
          title: "The Grace in Stubbornness",
          content: "People tell me I'm stubborn, but I prefer to say I'm principled. I know what I believe, and I stand by it. Working Monday to Saturday as a medic requires that unwavering standard! It's a busy life, but it has beautiful purpose.",
          mood: "Stubborn",
          category: "Secret Reflection"
        },
        {
          id: "d3",
          date: new Date().toLocaleDateString(),
          title: "My Anchor: Gospel Anthems & Siblings",
          content: "I listen to gospel music to find absolute strength and peace during chaotic days. It is my daily sanctuary. I am also incredibly thankful to God for my two siblings—a sister and a brother who are always in my prayers and on my side.",
          mood: "Peaceful",
          category: "Personal"
        },
        {
          id: "d4",
          date: new Date().toLocaleDateString(),
          title: "My Driving Dreams & Bright Future",
          content: "I am fully dedicated to hard work to ensure my future is exceptionally bright. I aim to achieve a lot of beautiful milestones in my life, step-by-step, with God's grace and consistent diligence. No limit to what we can reach!",
          mood: "Prayer Mode",
          category: "Personal"
        }
      ];
      await saveEncryptedEntries(demoEntries, pw);
      setEntries(demoEntries);
    } else {
      const encryptedItems = JSON.parse(rawEncryptedList) as any[];
      const decryptedList: DiaryEntry[] = [];
      for (const item of encryptedItems) {
        try {
          const title = await decryptText(item.encryptedTitle, pw);
          const content = await decryptText(item.encryptedContent, pw);
          decryptedList.push({
            id: item.id,
            date: item.date,
            title,
            content,
            mood: item.mood,
            category: item.category
          });
        } catch (err) {
          console.error("Failed to decrypt individual diary item:", err);
        }
      }
      
      // Auto-append personal entries if they don't already exist
      const hasD3 = decryptedList.some(e => e.id === "d3");
      const hasD4 = decryptedList.some(e => e.id === "d4");
      let updated = false;
      if (!hasD3) {
        decryptedList.push({
          id: "d3",
          date: new Date().toLocaleDateString(),
          title: "My Anchor: Gospel Anthems & Siblings",
          content: "I listen to gospel music to find absolute strength and peace during chaotic days. It is my daily sanctuary. I am also incredibly thankful to God for my two siblings—a sister and a brother who are always in my prayers and on my side.",
          mood: "Peaceful",
          category: "Personal"
        });
        updated = true;
      }
      if (!hasD4) {
        decryptedList.push({
          id: "d4",
          date: new Date().toLocaleDateString(),
          title: "My Driving Dreams & Bright Future",
          content: "I am fully dedicated to hard work to ensure my future is exceptionally bright. I aim to achieve a lot of beautiful milestones in my life, step-by-step, with God's grace and consistent diligence. No limit to what we can reach!",
          mood: "Prayer Mode",
          category: "Personal"
        });
        updated = true;
      }
      if (updated) {
        await saveEncryptedEntries(decryptedList, pw);
      }
      setEntries(decryptedList);
    }
  };

  const saveEncryptedEntries = async (currentPlainEntries: DiaryEntry[], passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    try {
      const encryptedItems = [];
      for (const entry of currentPlainEntries) {
        const encryptedTitle = await encryptText(entry.title, pw);
        const encryptedContent = await encryptText(entry.content, pw);
        encryptedItems.push({
          id: entry.id,
          date: entry.date,
          mood: entry.mood,
          category: entry.category,
          encryptedTitle,
          encryptedContent
        });
      }
      localStorage.setItem("jojo_secure_diary_v1", JSON.stringify(encryptedItems));
    } catch (err) {
      console.error("Failed to encrypt diary entries:", err);
    }
  };

  // --- CREDENTIALS CRYPTO LOGIC ---
  const loadCredentials = async (passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    const raw = localStorage.getItem("jojo_secure_credentials_v1");
    if (!raw) {
      const defaultCreds: VaultCredential[] = [
        {
          id: "c1",
          label: "Medication Safe Dial Safe Code",
          username: "Musawo Joan Incharge",
          secret: "44-Right | 22-Left | 19-Right | 09-Stop",
          notes: "Strict zero-knowledge code. Physical locker contains high-potency pediatrics.",
          category: "Lock Code",
          updatedAt: new Date().toLocaleDateString()
        },
        {
          id: "c2",
          label: "Anna Grace Clinic Records Server Key",
          username: "joan.musawo@annagrace.org",
          secret: "JoanGraceSecure@MedicalCenter2026!",
          notes: "Direct admin access code. Required to approve Friday night ward-log batches.",
          category: "Login",
          updatedAt: new Date().toLocaleDateString()
        },
        {
          id: "c3",
          label: "Personal Profile Details",
          username: "Musawo Joan",
          secret: "Faith & Aspirations",
          notes: "She listens to gospel music to find absolute strength. She has two siblings: a sister and a brother. She is dedicated to hard work to make her future exceptionally bright and aims to achieve a lot.",
          category: "Personal",
          updatedAt: new Date().toLocaleDateString()
        }
      ];
      await saveEncryptedCredentials(defaultCreds, pw);
      setCredentials(defaultCreds);
    } else {
      const encrypted = JSON.parse(raw) as any[];
      const decrypted: VaultCredential[] = [];
      for (const item of encrypted) {
        try {
          const secret = await decryptText(item.encryptedSecret, pw);
          const notes = item.encryptedNotes ? await decryptText(item.encryptedNotes, pw) : "";
          decrypted.push({
            id: item.id,
            label: item.label,
            username: item.username,
            secret,
            notes,
            category: item.category,
            updatedAt: item.updatedAt
          });
        } catch (err) {
          console.error("Failed to decrypt individual credential", err);
        }
      }
      
      // Auto-append personal details if not existing
      const hasC3 = decrypted.some(c => c.id === "c3");
      if (!hasC3) {
        decrypted.push({
          id: "c3",
          label: "Personal Profile Details",
          username: "Musawo Joan",
          secret: "Faith & Aspirations",
          notes: "She listens to gospel music to find absolute strength. She has two siblings: a sister and a brother. She is dedicated to hard work to make her future exceptionally bright and aims to achieve a lot.",
          category: "Personal",
          updatedAt: new Date().toLocaleDateString()
        });
        await saveEncryptedCredentials(decrypted, pw);
      }
      setCredentials(decrypted);
    }
  };

  const saveEncryptedCredentials = async (plainCreds: VaultCredential[], passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    try {
      const encrypted = [];
      for (const cred of plainCreds) {
        const encryptedSecret = await encryptText(cred.secret, pw);
        const encryptedNotes = cred.notes ? await encryptText(cred.notes, pw) : "";
        encrypted.push({
          id: cred.id,
          label: cred.label,
          username: cred.username,
          category: cred.category,
          updatedAt: cred.updatedAt,
          encryptedSecret,
          encryptedNotes
        });
      }
      localStorage.setItem("jojo_secure_credentials_v1", JSON.stringify(encrypted));
    } catch (err) {
      console.error("Failed to encrypt credentials", err);
    }
  };

  // --- STAFF LOGS CRYPTO LOGIC ---
  const loadStaffLogs = async (passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    const raw = localStorage.getItem("jojo_secure_staff_logs_v1");
    if (!raw) {
      const defaultLogs: StaffLog[] = [
        {
          id: "s1",
          staffName: "Nurse Martha Nakato",
          role: "Nurse",
          choreStatus: "Completed",
          performanceRating: 5,
          confidentialRemarks: "Completed pediatric checklists beautifully. Exemplary speed during Thursday peak traffic hours. Remained calm.",
          date: new Date().toLocaleDateString()
        },
        {
          id: "s2",
          staffName: "Intern Dr. Arthur Baker",
          role: "Intern",
          choreStatus: "Stubbornly Refused",
          performanceRating: 2,
          confidentialRemarks: "Failed to perform lab sample reviews and empty sterilization containers. Asserted that checking vitals was enough. Refused to sweep log. Spoke with him firmly about administrative discipline.",
          date: new Date().toLocaleDateString()
        }
      ];
      await saveEncryptedStaffLogs(defaultLogs, pw);
      setStaffLogs(defaultLogs);
    } else {
      const encrypted = JSON.parse(raw) as any[];
      const decrypted: StaffLog[] = [];
      for (const item of encrypted) {
        try {
          const confidentialRemarks = await decryptText(item.encryptedRemarks, pw);
          decrypted.push({
            id: item.id,
            staffName: item.staffName,
            role: item.role,
            choreStatus: item.choreStatus,
            performanceRating: item.performanceRating,
            confidentialRemarks,
            date: item.date
          });
        } catch (err) {
          console.error("Failed to decrypt individual staff log", err);
        }
      }
      setStaffLogs(decrypted);
    }
  };

  const saveEncryptedStaffLogs = async (plainLogs: StaffLog[], passwordToUse?: string) => {
    const pw = passwordToUse || vaultPassword || masterPassword;
    if (!pw) return;
    try {
      const encrypted = [];
      for (const log of plainLogs) {
        const encryptedRemarks = await encryptText(log.confidentialRemarks, pw);
        encrypted.push({
          id: log.id,
          staffName: log.staffName,
          role: log.role,
          choreStatus: log.choreStatus,
          performanceRating: log.performanceRating,
          date: log.date,
          encryptedRemarks
        });
      }
      localStorage.setItem("jojo_secure_staff_logs_v1", JSON.stringify(encrypted));
    } catch (err) {
      console.error("Failed to encrypt staff logs:", err);
    }
  };

  const handleUnsealVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultUnlockInput) return;
    setVaultUnlockError("");

    const checkPayload = localStorage.getItem("jojo_vault_password_check");
    const testPayload = checkPayload || localStorage.getItem("jojo_os_check_v1");

    if (!testPayload) {
      // If absolutely no keys exist anywhere, provision on the fly!
      try {
        const payload = await createPasswordCheckPayload(vaultUnlockInput);
        localStorage.setItem("jojo_vault_password_check", payload);
        setVaultPassword(vaultUnlockInput);
        setIsVaultUnlocked(true);
        await loadAllSecureData(vaultUnlockInput);
      } catch (err) {
        setVaultUnlockError("Initialization error.");
      }
    } else {
      try {
        const isValid = await verifyMasterPassword(vaultUnlockInput, testPayload);
        if (isValid) {
          // If using os check, set check for vault password check for future
          if (!checkPayload) {
            localStorage.setItem("jojo_vault_password_check", testPayload);
          }
          setVaultPassword(vaultUnlockInput);
          setIsVaultUnlocked(true);
          await loadAllSecureData(vaultUnlockInput);
        } else {
          setVaultUnlockError("Invalid passphrase. Your Incharge security key remains sealed.");
        }
      } catch (err) {
        setVaultUnlockError("Decryption check failed.");
      }
    }
  };

  const handleChangeVaultPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    if (!currentPass || !newPass || !confirmNewPass) return;

    if (newPass.length < 4) {
      setPasswordChangeError("New password must be at least 4 characters.");
      return;
    }

    if (newPass !== confirmNewPass) {
      setPasswordChangeError("New passwords do not match.");
      return;
    }

    const checkPayload = localStorage.getItem("jojo_vault_password_check") || localStorage.getItem("jojo_os_check_v1");
    if (checkPayload) {
      const isValid = await verifyMasterPassword(currentPass, checkPayload);
      if (!isValid) {
        setPasswordChangeError("Incorrect current password.");
        return;
      }
    }

    try {
      setStatusMsg("Decrypting databases and re-encrypting with new key...");
      
      // 1. Re-encrypt Entries
      const encryptedItems = [];
      for (const entry of entries) {
        const encryptedTitle = await encryptText(entry.title, newPass);
        const encryptedContent = await encryptText(entry.content, newPass);
        encryptedItems.push({
          id: entry.id,
          date: entry.date,
          mood: entry.mood,
          category: entry.category,
          encryptedTitle,
          encryptedContent
        });
      }
      localStorage.setItem("jojo_secure_diary_v1", JSON.stringify(encryptedItems));

      // 2. Re-encrypt Credentials
      const encryptedCreds = [];
      for (const cred of credentials) {
        const encryptedSecret = await encryptText(cred.secret, newPass);
        const encryptedNotes = cred.notes ? await encryptText(cred.notes, newPass) : "";
        encryptedCreds.push({
          id: cred.id,
          label: cred.label,
          username: cred.username,
          category: cred.category,
          updatedAt: cred.updatedAt,
          encryptedSecret,
          encryptedNotes
        });
      }
      localStorage.setItem("jojo_secure_credentials_v1", JSON.stringify(encryptedCreds));

      // 3. Re-encrypt Staff Logs
      const encryptedLogs = [];
      for (const log of staffLogs) {
        const encryptedRemarks = await encryptText(log.confidentialRemarks, newPass);
        encryptedLogs.push({
          id: log.id,
          staffName: log.staffName,
          role: log.role,
          choreStatus: log.choreStatus,
          performanceRating: log.performanceRating,
          date: log.date,
          encryptedRemarks
        });
      }
      localStorage.setItem("jojo_secure_staff_logs_v1", JSON.stringify(encryptedLogs));

      const newCheckPayload = await createPasswordCheckPayload(newPass);
      localStorage.setItem("jojo_vault_password_check", newCheckPayload);

      setVaultPassword(newPass);
      setCurrentPass("");
      setNewPass("");
      setConfirmNewPass("");
      setPasswordChangeSuccess("Vault successfully re-encrypted with your new security credentials!");
    } catch (err) {
      console.error(err);
      setPasswordChangeError("Failed to re-encrypt vault. Data remains secured with old key.");
    } finally {
      setStatusMsg("");
    }
  };

  // --- ACTIONS: DIARY ---
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newEntry: DiaryEntry = {
      id: "d_" + Math.random().toString(36).substring(2, 9),
      date: new Date().toLocaleDateString(),
      title: newTitle,
      content: newContent,
      mood: newMood,
      category: newCategory
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    await saveEncryptedEntries(updated);
    
    setNewTitle("");
    setNewContent("");
    setIsCreatingEntry(false);
    setSelectedEntry(newEntry);
  };

  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently erase this encrypted reflection from secure storage?")) {
      const updated = entries.filter(item => item.id !== id);
      setEntries(updated);
      await saveEncryptedEntries(updated);
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    }
  };

  // --- ACTIONS: CREDENTIALS ---
  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credLabel.trim() || !credSecret.trim()) return;

    const newCred: VaultCredential = {
      id: "c_" + Math.random().toString(36).substring(2, 9),
      label: credLabel,
      username: credUsername || undefined,
      secret: credSecret,
      notes: credNotes || undefined,
      category: credCategory,
      updatedAt: new Date().toLocaleDateString()
    };

    const updated = [newCred, ...credentials];
    setCredentials(updated);
    await saveEncryptedCredentials(updated);

    setCredLabel("");
    setCredUsername("");
    setCredSecret("");
    setCredNotes("");
    setIsCreatingCred(false);
    setSelectedCred(newCred);
  };

  const handleDeleteCredential = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Permanently erase this clinical credential? This operation is irreversible.")) {
      const updated = credentials.filter(item => item.id !== id);
      setCredentials(updated);
      await saveEncryptedCredentials(updated);
      if (selectedCred?.id === id) {
        setSelectedCred(null);
      }
    }
  };

  // --- ACTIONS: STAFF ---
  const handleCreateStaffLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffRemarks.trim()) return;

    const newLog: StaffLog = {
      id: "s_" + Math.random().toString(36).substring(2, 9),
      staffName,
      role: staffRole,
      choreStatus: staffChoreStatus,
      performanceRating: staffPerformance,
      confidentialRemarks: staffRemarks,
      date: new Date().toLocaleDateString()
    };

    const updated = [newLog, ...staffLogs];
    setStaffLogs(updated);
    await saveEncryptedStaffLogs(updated);

    setStaffName("");
    setStaffRemarks("");
    setStaffPerformance(5);
    setIsCreatingStaffLog(false);
    setSelectedStaffLog(newLog);
  };

  const handleDeleteStaffLog = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Erase this clinical staff evaluation record?")) {
      const updated = staffLogs.filter(item => item.id !== id);
      setStaffLogs(updated);
      await saveEncryptedStaffLogs(updated);
      if (selectedStaffLog?.id === id) {
        setSelectedStaffLog(null);
      }
    }
  };

  // --- UTILITIES: COPY / REVEAL ---
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRevealSecret = (id: string) => {
    if (revealedIds.includes(id)) {
      setRevealedIds(revealedIds.filter(x => x !== id));
    } else {
      setRevealedIds([...revealedIds, id]);
    }
  };

  const generateSecurePassword = () => {
    let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (genIncludeNumbers) chars += "0123456789";
    if (genIncludeSymbols) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    
    let generated = "";
    for (let i = 0; i < genLength; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCredSecret(generated);
  };

  // --- CLINICAL IMPORT & EXPORT SYSTEM ---
  const handleExportBackup = () => {
    try {
      const backupData = {
        check: localStorage.getItem("jojo_os_check_v1"),
        diary: localStorage.getItem("jojo_secure_diary_v1"),
        credentials: localStorage.getItem("jojo_secure_credentials_v1"),
        staffLogs: localStorage.getItem("jojo_secure_staff_logs_v1"),
        version: "1.0",
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jojo_vault_unshakable_backup_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to export your secure cryptographic backup.");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    setImportSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data.check || !data.diary) {
          setImportError("Invalid file structure. This does not appear to be a JoJo Vault backup file.");
          return;
        }

        // Write to local storage
        localStorage.setItem("jojo_os_check_v1", data.check);
        localStorage.setItem("jojo_secure_diary_v1", data.diary);
        if (data.credentials) localStorage.setItem("jojo_secure_credentials_v1", data.credentials);
        if (data.staffLogs) localStorage.setItem("jojo_secure_staff_logs_v1", data.staffLogs);

        setImportSuccess("Security backup loaded successfully! Reloading environment to unseal databases...");
        setTimeout(() => {
          window.location.reload();
        }, 1800);
      } catch (err) {
        setImportError("Failed to parse file. Ensure it is a valid decrypted-level json configuration.");
      }
    };
    reader.readAsText(file);
  };

  // Filter listings
  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(diarySearch.toLowerCase()) || 
    e.content.toLowerCase().includes(diarySearch.toLowerCase())
  );

  const filteredCredentials = credentials.filter(c => 
    c.label.toLowerCase().includes(credSearch.toLowerCase()) || 
    (c.notes && c.notes.toLowerCase().includes(credSearch.toLowerCase()))
  );

  const filteredStaffLogs = staffLogs.filter(s => 
    s.staffName.toLowerCase().includes(staffSearch.toLowerCase()) || 
    s.confidentialRemarks.toLowerCase().includes(staffSearch.toLowerCase())
  );

  if (!isVaultUnlocked) {
    return (
      <div className="flex h-full items-center justify-center bg-[#07080a] text-sm text-[#E0E0E0] p-4 relative overflow-y-auto">
        {/* Soft background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#8E7AB5]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-[#B4D4FF]/5 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#121417]/95 border border-[#8E7AB5]/20 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8E7AB5]/20 to-[#B4D4FF]/20 flex items-center justify-center border border-[#8E7AB5]/30">
              <LockKeyhole className="h-6 w-6 text-[#B4D4FF]" />
            </div>
            <h2 className="text-xl font-semibold text-white tracking-wide">Joan's Incharge Controller Vault</h2>
            <p className="text-xs text-white/50">Military-grade AES-GCM-256 Offline Encryption</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#8E7AB5]/5 border border-[#8E7AB5]/10 text-xs text-slate-300 leading-relaxed text-center space-y-1">
            <p className="font-semibold text-[#B4D4FF]">🔒 Cryptographic Seal Engaged</p>
            <p className="text-[11px] text-white/60">
              Your secretive reflections, medical drawer keycodes, and staff evaluations are unreadable without your unseal passphrase.
            </p>
          </div>

          <form onSubmit={handleUnsealVault} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-mono">Enter Vault Passphrase</label>
              <div className="relative">
                <input
                  type={revealUnlockPass ? "text" : "password"}
                  required
                  value={vaultUnlockInput}
                  onChange={(e) => {
                    setVaultUnlockInput(e.target.value);
                    setVaultUnlockError("");
                  }}
                  placeholder="Password..."
                  className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-3 pr-10 text-xs text-white font-mono focus:outline-none focus:border-[#8E7AB5] text-center"
                />
                <button
                  type="button"
                  onClick={() => setRevealUnlockPass(!revealUnlockPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition cursor-pointer"
                >
                  {revealUnlockPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {vaultUnlockError && (
                <p className="text-[11px] text-red-400 mt-1.5 font-mono text-center flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> {vaultUnlockError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition cursor-pointer shadow-lg transform active:scale-95"
            >
              <LockKeyhole className="h-4 w-4" /> Unseal Secure Vault
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-white/30 space-y-1 border-t border-white/5">
            <p>💡 Default password: your OS screen password.</p>
            <p className="text-[10px]">Passwords are processed only in-memory and never sent to any server.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-[#E0E0E0] bg-[#0D0F12]">
      {/* Zero-Knowledge System Status Banner */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#8E7AB5]/5 px-5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#B4D4FF] animate-pulse" />
          <span className="font-medium text-white/80 uppercase tracking-widest text-[10px]">Joan's Incharge Controller Vault</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-white/50">
          <span className="flex items-center gap-1">
            <LockKeyhole className="h-3 w-3 text-[#4ADE80]" /> AES-GCM-256 Armed
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]"></span>
          <button
            onClick={() => {
              setVaultPassword("");
              setVaultUnlockInput("");
              setIsVaultUnlocked(false);
              setEntries([]);
              setCredentials([]);
              setStaffLogs([]);
              setStatusMsg("");
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-950/40 hover:bg-red-900/30 text-red-300 border border-red-500/20 transition cursor-pointer font-bold uppercase tracking-wider text-[9px]"
          >
            <LogOut className="h-2.5 w-2.5" /> Seal Vault
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-[#B4D4FF]/10 text-[#B4D4FF] px-4 py-1.5 text-center text-xs font-mono border-b border-white/5">
          {statusMsg}
        </div>
      )}

      {/* Main vault area with Left tabs and Right workspace */}
      <div className="flex flex-1 overflow-hidden md:flex-row flex-col">
        
        {/* Left Side Tab Navigation */}
        <div className="w-full md:w-56 bg-white/[0.02] border-r border-white/10 flex flex-row md:flex-col p-2 gap-1.5 shrink-0 overflow-x-auto md:overflow-y-auto">
          <button
            onClick={() => { setActiveSubTab("diary"); setSelectedEntry(null); setIsCreatingEntry(false); }}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition duration-300 w-full shrink-0 md:shrink ${
              activeSubTab === "diary"
                ? "bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 text-white border-l-2 border-[#8E7AB5]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <BookOpen className="h-4 w-4 text-rose-400" />
            <div className="text-left">
              <p className="font-semibold">Guarded Journals</p>
              <p className="text-[9px] opacity-40 hidden md:block">Secrets & Devotions</p>
            </div>
          </button>

          <button
            onClick={() => { setActiveSubTab("credentials"); setSelectedCred(null); setIsCreatingCred(false); }}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition duration-300 w-full shrink-0 md:shrink ${
              activeSubTab === "credentials"
                ? "bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 text-white border-l-2 border-[#8E7AB5]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <KeyRound className="h-4 w-4 text-[#B4D4FF]" />
            <div className="text-left">
              <p className="font-semibold">Clinical Keys</p>
              <p className="text-[9px] opacity-40 hidden md:block">Drawer & Cabinet Locks</p>
            </div>
          </button>

          <button
            onClick={() => { setActiveSubTab("staff"); setSelectedStaffLog(null); setIsCreatingStaffLog(false); }}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition duration-300 w-full shrink-0 md:shrink ${
              activeSubTab === "staff"
                ? "bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 text-white border-l-2 border-[#8E7AB5]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4 text-[#4ADE80]" />
            <div className="text-left">
              <p className="font-semibold">Staff Evaluation</p>
              <p className="text-[9px] opacity-40 hidden md:block">Chore & Discipline Audits</p>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab("security")}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left text-xs font-medium transition duration-300 w-full shrink-0 md:shrink ${
              activeSubTab === "security"
                ? "bg-gradient-to-r from-[#8E7AB5]/20 to-[#B4D4FF]/20 text-white border-l-2 border-[#8E7AB5]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <p className="font-semibold">Vault Security</p>
              <p className="text-[9px] opacity-40 hidden md:block">Backup & Diagnostics</p>
            </div>
          </button>
        </div>

        {/* --- VIEWSPACE: DIARY MODULE --- */}
        {activeSubTab === "diary" && (
          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* List sidebar */}
            <div className={`w-full md:w-64 border-r border-white/10 bg-white/[0.01] flex flex-col shrink-0 ${ (selectedEntry || isCreatingEntry) ? "hidden md:flex" : "flex" }`}>
              <div className="p-4 border-b border-white/10 flex justify-between items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search secrets..."
                    value={diarySearch}
                    onChange={(e) => setDiarySearch(e.target.value)}
                    className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-1.5 pl-7 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#8E7AB5]"
                  />
                </div>
                <button
                  onClick={() => { setIsCreatingEntry(true); setSelectedEntry(null); }}
                  className="p-2 bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 rounded-xl text-black font-bold cursor-pointer shadow-sm shrink-0"
                  title="New Entry"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {isDecryptingDiary ? (
                  <div className="py-12 text-center text-white/40 font-mono text-xs">
                    <RefreshCw className="animate-spin h-5 w-5 mx-auto mb-2 text-[#8E7AB5]" />
                    <p>Decrypting records...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <p className="py-12 text-center text-xs text-white/30">No secure journals found.</p>
                ) : (
                  filteredEntries.map(entry => {
                    const isActive = selectedEntry?.id === entry.id;
                    return (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setSelectedEntry(entry);
                          setIsCreatingEntry(false);
                        }}
                        className={`group relative p-3 rounded-2xl cursor-pointer border transition text-left ${
                          isActive
                            ? "bg-white/10 border-[#8E7AB5]/40 text-white shadow-md"
                            : "bg-[#121417]/40 border-white/5 hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-medium text-xs truncate max-w-[130px]">{entry.title}</span>
                          <button
                            onClick={(e) => handleDeleteEntry(entry.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 text-white/30 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-[9px] text-white/40">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-2.5 w-2.5" />
                            {entry.date}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono border ${
                            entry.mood === "Stubborn" ? "bg-amber-950/20 text-amber-300 border-amber-500/20" :
                            entry.mood === "Exhausted" ? "bg-purple-950/20 text-purple-300 border-purple-500/20" :
                            entry.mood === "Peaceful" ? "bg-emerald-950/20 text-emerald-300 border-emerald-500/20" :
                            entry.mood === "Grateful" ? "bg-blue-950/20 text-[#B4D4FF] border-[#B4D4FF]/20" :
                            "bg-rose-950/20 text-rose-300 border-rose-500/20"
                          }`}>
                            {entry.mood}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* View/Edit Section */}
            <div className={`flex-1 bg-white/[0.005] p-5 overflow-y-auto flex flex-col justify-between ${ (selectedEntry || isCreatingEntry) ? "flex" : "hidden md:flex" }`}>
              <AnimatePresence mode="wait">
                {isCreatingEntry ? (
                  <motion.form
                    key="diary-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleCreateEntry}
                    className="space-y-4 flex flex-col h-full justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCreatingEntry(false)}
                            className="md:hidden p-1.5 rounded-xl bg-white/5 text-white hover:bg-white/10 cursor-pointer text-xs font-bold"
                          >
                            ← Back
                          </button>
                          <span className="text-[10px] text-[#B4D4FF] font-mono tracking-wider uppercase">Unsealing Crypt Writer</span>
                        </div>
                        <span className="text-[10px] text-white/40">AES Protected</span>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Journal Title</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="e.g., Exhausting Ward Audit Reflections..."
                          className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Your Vibe / State</label>
                          <select
                            value={newMood}
                            onChange={(e) => setNewMood(e.target.value as any)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          >
                            <option value="Peaceful">Peaceful 🌿</option>
                            <option value="Stubborn">Stubborn but Principled 🤫</option>
                            <option value="Exhausted">Exhausted Clinician 🩺</option>
                            <option value="Grateful">Grateful & Prayerful 🙏</option>
                            <option value="Anxious">Reflecting Quietly 🕊️</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Category</label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as any)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          >
                            <option value="Personal">Personal Diary 🔒</option>
                            <option value="Medic Devotion">Medic Devotion 🏥</option>
                            <option value="Secret Reflection">Secret Reflection 🦁</option>
                            <option value="Anna Grace Note">Anna Grace Note 🩺</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Personal Reflection</label>
                        <textarea
                          required
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          placeholder="Musawo Joan, write your secrets here. They are encrypted instantly on your disk..."
                          className="w-full min-h-[160px] md:min-h-[220px] bg-[#1A1D23] border border-white/10 rounded-2xl p-3.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5] resize-none leading-relaxed font-serif italic"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCreatingEntry(false)}
                        className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 font-medium transition text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold flex items-center gap-1.5 transition text-xs cursor-pointer shadow-md"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt & Store
                      </button>
                    </div>
                  </motion.form>
                ) : selectedEntry ? (
                  <motion.div
                    key="diary-viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-xl mx-auto w-full"
                  >
                    <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(null)}
                            className="md:hidden px-2 py-1 rounded-lg bg-white/5 text-xs text-white hover:bg-white/10 cursor-pointer font-bold"
                          >
                            ← Back
                          </button>
                          <span className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full bg-[#8E7AB5]/10 text-[#B4D4FF] border border-[#8E7AB5]/20">
                            {selectedEntry.category}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mt-2.5">{selectedEntry.title}</h2>
                      </div>
                      <div className="text-right text-[10px] text-white/40 font-mono">
                        <p className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" /> {selectedEntry.date}
                        </p>
                        <p className="mt-1">Mood: <span className="font-semibold text-[#B4D4FF]">{selectedEntry.mood}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-[#4ADE80]/5 border border-[#4ADE80]/15 p-2.5 text-xs text-[#4ADE80]">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="font-mono text-[10.5px]">Decrypted successfully in memory. Zero plain-data logs preserved.</span>
                    </div>

                    <div className="font-serif leading-relaxed text-white/90 whitespace-pre-wrap text-sm md:text-base italic p-5 bg-[#121417] rounded-3xl border border-white/5 shadow-inner leading-relaxed">
                      "{selectedEntry.content}"
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        onClick={() => {
                          setNewTitle(selectedEntry.title);
                          setNewContent(selectedEntry.content);
                          setNewMood(selectedEntry.mood);
                          setNewCategory(selectedEntry.category);
                          setIsCreatingEntry(true);
                          setEntries(entries.filter(e => e.id !== selectedEntry.id));
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition text-xs cursor-pointer"
                      >
                        Edit Entry
                      </button>
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="px-4 py-2 rounded-xl bg-[#1A1D23] hover:opacity-90 border border-white/5 text-white/50 transition text-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 text-center py-12">
                    <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-3 text-[#8E7AB5]">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-white/80 text-sm tracking-wider uppercase">Unsealed Reflective Journal</h3>
                    <p className="text-xs text-white/40 mt-1 max-w-xs">Your personal thoughts are secured inside an AES-GCM-256 local ledger.</p>
                    <button
                      onClick={() => setIsCreatingEntry(true)}
                      className="mt-4 px-4 py-1.5 rounded-full bg-[#8E7AB5]/10 hover:bg-[#8E7AB5]/20 text-xs text-[#B4D4FF] border border-[#8E7AB5]/20 transition cursor-pointer"
                    >
                      Write Confidential Log
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- VIEWSPACE: CLINICAL KEYS & CABINET LOCK CODES --- */}
        {activeSubTab === "credentials" && (
          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* List sidebar */}
            <div className={`w-full md:w-64 border-r border-white/10 bg-white/[0.01] flex flex-col shrink-0 ${ (selectedCred || isCreatingCred) ? "hidden md:flex" : "flex" }`}>
              <div className="p-4 border-b border-white/10 flex justify-between items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search lock codes..."
                    value={credSearch}
                    onChange={(e) => setCredSearch(e.target.value)}
                    className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-1.5 pl-7 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#8E7AB5]"
                  />
                </div>
                <button
                  onClick={() => { setIsCreatingCred(true); setSelectedCred(null); }}
                  className="p-2 bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 rounded-xl text-black font-bold cursor-pointer shadow-sm shrink-0"
                  title="Add Key Code"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredCredentials.length === 0 ? (
                  <p className="py-12 text-center text-xs text-white/30">No security credentials recorded.</p>
                ) : (
                  filteredCredentials.map(cred => {
                    const isActive = selectedCred?.id === cred.id;
                    return (
                      <div
                        key={cred.id}
                        onClick={() => {
                          setSelectedCred(cred);
                          setIsCreatingCred(false);
                        }}
                        className={`group relative p-3 rounded-2xl cursor-pointer border transition text-left ${
                          isActive
                            ? "bg-white/10 border-[#8E7AB5]/40 text-white shadow-md"
                            : "bg-[#121417]/40 border-white/5 hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-medium text-xs truncate max-w-[130px]">{cred.label}</span>
                          <button
                            onClick={(e) => handleDeleteCredential(cred.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 text-white/30 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-[9px] text-white/40">
                          <span className="text-[8.5px] font-mono tracking-wider text-[#B4D4FF]/80 uppercase">{cred.category}</span>
                          <span className="text-[8.5px] font-mono">{cred.updatedAt}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* View/Edit Section */}
            <div className={`flex-1 bg-white/[0.005] p-5 overflow-y-auto flex flex-col justify-between ${ (selectedCred || isCreatingCred) ? "flex" : "hidden md:flex" }`}>
              <AnimatePresence mode="wait">
                {isCreatingCred ? (
                  <motion.form
                    key="cred-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleCreateCredential}
                    className="space-y-4 max-w-lg mx-auto w-full"
                  >
                    <div className="border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingCred(false)}
                          className="md:hidden px-2.5 py-1 rounded-xl bg-white/5 text-xs text-white hover:bg-white/10 cursor-pointer font-bold"
                        >
                          ← Back
                        </button>
                        <span className="text-[10px] text-[#B4D4FF] font-mono uppercase tracking-wider block">LOCKER KEYS & CODE BUILDER</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white/90 mt-1">Protect Clinical Logins, Safe Dials & System Overrides</h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Key Label / Location</label>
                        <input
                          type="text"
                          required
                          value={credLabel}
                          onChange={(e) => setCredLabel(e.target.value)}
                          placeholder="e.g., Ward-B Narcotic Vault Dial Combo"
                          className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Username / Label Identifier</label>
                          <input
                            type="text"
                            value={credUsername}
                            onChange={(e) => setCredUsername(e.target.value)}
                            placeholder="e.g., Joan Incharge (Optional)"
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Key Category</label>
                          <select
                            value={credCategory}
                            onChange={(e) => setCredCategory(e.target.value as any)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          >
                            <option value="Lock Code">Physical Lock Combo 🔒</option>
                            <option value="Login">Website / Portal Password 🌐</option>
                            <option value="Override Key">Emergency Override Key ⚠️</option>
                            <option value="Personal">Personal Safe Combo 🔑</option>
                            <option value="Other">Other Code</option>
                          </select>
                        </div>
                      </div>

                      {/* Cryptographic password generator tool */}
                      <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] uppercase tracking-wider text-[#B4D4FF] font-mono flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3" /> Secure Passphrase Generator
                          </span>
                          <button
                            type="button"
                            onClick={generateSecurePassword}
                            className="text-[9px] px-2.5 py-1 rounded bg-[#8E7AB5]/15 border border-[#8E7AB5]/25 text-[#B4D4FF] hover:bg-[#8E7AB5]/30 cursor-pointer font-mono"
                          >
                            Generate Key
                          </button>
                        </div>
                        
                        <div className="flex gap-4 items-center text-xs">
                          <label className="flex items-center gap-1.5 text-white/50 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={genIncludeSymbols}
                              onChange={(e) => setGenIncludeSymbols(e.target.checked)}
                              className="accent-[#8E7AB5]"
                            />
                            <span>Symbols (@#$)</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-white/50 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={genIncludeNumbers}
                              onChange={(e) => setGenIncludeNumbers(e.target.checked)}
                              className="accent-[#8E7AB5]"
                            />
                            <span>Numbers (0-9)</span>
                          </label>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-white/40">Len:</span>
                            <input
                              type="number"
                              min={6}
                              max={32}
                              value={genLength}
                              onChange={(e) => setGenLength(parseInt(e.target.value) || 12)}
                              className="w-11 bg-[#1A1D23] border border-white/10 rounded-lg p-1 text-center text-xs font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">The Secret / Passcode (Will Encrypt on save)</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={credSecret}
                            onChange={(e) => setCredSecret(e.target.value)}
                            placeholder="Enter the secure string, dial number or password..."
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 pr-10 text-xs text-white font-mono focus:outline-none focus:border-[#8E7AB5]"
                          />
                          <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Locker Notes / Guidelines</label>
                        <textarea
                          value={credNotes}
                          onChange={(e) => setCredNotes(e.target.value)}
                          placeholder="Add instructions (e.g. key location, who to ask, override procedures)..."
                          className="w-full min-h-[70px] bg-[#1A1D23] border border-white/10 rounded-2xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5] resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCreatingCred(false)}
                        className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 font-medium transition text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold flex items-center gap-1.5 transition text-xs cursor-pointer shadow-md"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt & Seal Key
                      </button>
                    </div>
                  </motion.form>
                ) : selectedCred ? (
                  <motion.div
                    key="cred-viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-md mx-auto w-full text-left"
                  >
                    <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCred(null)}
                            className="md:hidden px-2 py-1 rounded-lg bg-white/5 text-xs text-white hover:bg-white/10 cursor-pointer font-bold"
                          >
                            ← Back
                          </button>
                          <span className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full bg-[#8E7AB5]/10 text-[#B4D4FF] border border-[#8E7AB5]/20">
                            {selectedCred.category}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-white mt-2.5">{selectedCred.label}</h2>
                      </div>
                      <span className="text-[9px] opacity-40 font-mono mt-1">Updated {selectedCred.updatedAt}</span>
                    </div>

                    {/* Sensitive credentials field */}
                    <div className="p-4 bg-[#121417] rounded-3xl border border-white/5 space-y-3 shadow-inner">
                      {selectedCred.username && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">User Identifier / Scope</span>
                          <span className="text-xs text-white/80 font-mono font-medium">{selectedCred.username}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">Secured Key Value</span>
                        <div className="flex gap-2.5 items-center">
                          <input
                            type={revealedIds.includes(selectedCred.id) ? "text" : "password"}
                            readOnly
                            value={selectedCred.secret}
                            className="bg-black/40 border border-white/5 rounded-xl p-2.5 text-xs text-[#4ADE80] font-mono flex-1 focus:outline-none"
                          />
                          
                          <button
                            onClick={() => toggleRevealSecret(selectedCred.id)}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-white/60 hover:text-white cursor-pointer"
                            title={revealedIds.includes(selectedCred.id) ? "Hide Code" : "Reveal Code"}
                          >
                            {revealedIds.includes(selectedCred.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => copyToClipboard(selectedCred.secret, selectedCred.id)}
                            className="p-2.5 rounded-xl bg-[#8E7AB5]/15 hover:bg-[#8E7AB5]/25 border border-[#8E7AB5]/20 text-[#B4D4FF] transition cursor-pointer"
                            title="Copy Combo to Clipboard"
                          >
                            {copiedId === selectedCred.id ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {selectedCred.notes && (
                        <div className="space-y-1 pt-1.5 border-t border-white/5">
                          <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">Cabinet / Key Instructions</span>
                          <p className="text-xs text-white/70 leading-relaxed italic">{selectedCred.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        onClick={() => {
                          setCredLabel(selectedCred.label);
                          setCredUsername(selectedCred.username || "");
                          setCredSecret(selectedCred.secret);
                          setCredNotes(selectedCred.notes || "");
                          setCredCategory(selectedCred.category);
                          setIsCreatingCred(true);
                          setCredentials(credentials.filter(c => c.id !== selectedCred.id));
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition text-xs cursor-pointer"
                      >
                        Modify Details
                      </button>
                      <button
                        onClick={() => setSelectedCred(null)}
                        className="px-4 py-2 rounded-xl bg-[#1A1D23] hover:opacity-90 border border-white/5 text-white/50 transition text-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 text-center py-12">
                    <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-3 text-[#B4D4FF]">
                      <KeyRound className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-white/80 text-sm tracking-wider uppercase">Secure Clinical Lockbox</h3>
                    <p className="text-xs text-white/40 mt-1 max-w-xs">Instantly generate or store safe dial combinations, security credentials, and cabinet keys.</p>
                    <button
                      onClick={() => setIsCreatingCred(true)}
                      className="mt-4 px-4 py-1.5 rounded-full bg-[#8E7AB5]/10 hover:bg-[#8E7AB5]/20 text-xs text-[#B4D4FF] border border-[#8E7AB5]/20 transition cursor-pointer"
                    >
                      Record Lock Code
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- VIEWSPACE: STAFF DISCIPLINE & CHORE EVALUATIONS --- */}
        {activeSubTab === "staff" && (
          <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
            {/* List sidebar */}
            <div className={`w-full md:w-64 border-r border-white/10 bg-white/[0.01] flex flex-col shrink-0 ${ (selectedStaffLog || isCreatingStaffLog) ? "hidden md:flex" : "flex" }`}>
              <div className="p-4 border-b border-white/10 flex justify-between items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search staff logs..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-1.5 pl-7 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#8E7AB5]"
                  />
                </div>
                <button
                  onClick={() => { setIsCreatingStaffLog(true); setSelectedStaffLog(null); }}
                  className="p-2 bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 rounded-xl text-black font-bold cursor-pointer shadow-sm shrink-0"
                  title="Add Staff Record"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filteredStaffLogs.length === 0 ? (
                  <p className="py-12 text-center text-xs text-white/30">No staff evaluation audits found.</p>
                ) : (
                  filteredStaffLogs.map(log => {
                    const isActive = selectedStaffLog?.id === log.id;
                    return (
                      <div
                        key={log.id}
                        onClick={() => {
                          setSelectedStaffLog(log);
                          setIsCreatingStaffLog(false);
                        }}
                        className={`group relative p-3 rounded-2xl cursor-pointer border transition text-left ${
                          isActive
                            ? "bg-white/10 border-[#8E7AB5]/40 text-white shadow-md"
                            : "bg-[#121417]/40 border-white/5 hover:bg-white/5 text-white/70"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-medium text-xs truncate max-w-[130px]">{log.staffName}</span>
                          <button
                            onClick={(e) => handleDeleteStaffLog(log.id, e)}
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 text-white/30 transition cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2 text-[9px]">
                          <span className="font-mono text-white/40">{log.role}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono border ${
                            log.choreStatus === "Completed" ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" :
                            log.choreStatus === "Incomplete" ? "bg-amber-950/20 text-amber-300 border-amber-500/20" :
                            "bg-red-950/20 text-red-400 border-red-500/20 animate-pulse"
                          }`}>
                            {log.choreStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* View/Edit Section */}
            <div className={`flex-1 bg-white/[0.005] p-5 overflow-y-auto flex flex-col justify-between ${ (selectedStaffLog || isCreatingStaffLog) ? "flex" : "hidden md:flex" }`}>
              <AnimatePresence mode="wait">
                {isCreatingStaffLog ? (
                  <motion.form
                    key="staff-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleCreateStaffLog}
                    className="space-y-4 max-w-lg mx-auto w-full"
                  >
                    <div className="border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingStaffLog(false)}
                          className="md:hidden px-2.5 py-1 rounded-xl bg-white/5 text-xs text-white hover:bg-white/10 cursor-pointer font-bold"
                        >
                          ← Back
                        </button>
                        <span className="text-[10px] text-[#4ADE80] font-mono uppercase tracking-wider block">CONFIDENTIAL STAFF LOGS</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white/90 mt-1">Audit Chore Completion & Clinical Attention levels</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Staff Name</label>
                          <input
                            type="text"
                            required
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            placeholder="e.g., Nurse Martha Nakato"
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Role</label>
                          <select
                            value={staffRole}
                            onChange={(e) => setStaffRole(e.target.value as any)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          >
                            <option value="Nurse">Nurse 🩺</option>
                            <option value="Clinical Officer">Clinical Officer 🩺</option>
                            <option value="Lab Tech">Lab Assistant 🔬</option>
                            <option value="Intern">Intern Resident 📋</option>
                            <option value="Admin">Administrative Staff 🌐</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Chore Execution Status</label>
                          <select
                            value={staffChoreStatus}
                            onChange={(e) => setStaffChoreStatus(e.target.value as any)}
                            className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                          >
                            <option value="Completed">Completed All Chores ✅</option>
                            <option value="Incomplete">Incomplete / Forgotten ⚠️</option>
                            <option value="Stubbornly Refused">Stubbornly Refused 🦁</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Performance (1 - 5 Stars)</label>
                          <div className="flex gap-2 items-center h-10 px-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setStaffPerformance(star)}
                                className="transition transform hover:scale-110 cursor-pointer"
                              >
                                <Star className={`h-5 w-5 ${star <= staffPerformance ? "text-amber-400 fill-amber-400" : "text-white/20"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Confidential Incharge Assessment (Will Encrypt)</label>
                        <textarea
                          required
                          value={staffRemarks}
                          onChange={(e) => setStaffRemarks(e.target.value)}
                          placeholder="Write private ratings about clinical skills, attendance speed, stubborn feedback, or counseling results..."
                          className="w-full min-h-[140px] bg-[#1A1D23] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsCreatingStaffLog(false)}
                        className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/70 font-medium transition text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold flex items-center gap-1.5 transition text-xs cursor-pointer shadow-md"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Encrypt & Save Log
                      </button>
                    </div>
                  </motion.form>
                ) : selectedStaffLog ? (
                  <motion.div
                    key="staff-viewer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-w-lg mx-auto w-full text-left"
                  >
                    <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStaffLog(null)}
                            className="md:hidden px-2 py-1 rounded-lg bg-white/5 text-xs text-white hover:bg-white/10 cursor-pointer font-bold"
                          >
                            ← Back
                          </button>
                          <span className="text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20">
                            {selectedStaffLog.role}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-white mt-2.5">{selectedStaffLog.staffName}</h2>
                      </div>
                      <span className="text-[9px] opacity-40 font-mono mt-1">Logged {selectedStaffLog.date}</span>
                    </div>

                    <div className="p-4 bg-[#121417] rounded-3xl border border-white/5 space-y-4 shadow-inner">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">Chore Performance</span>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] mt-1 font-mono border ${
                            selectedStaffLog.choreStatus === "Completed" ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" :
                            selectedStaffLog.choreStatus === "Incomplete" ? "bg-amber-950/20 text-amber-300 border-amber-500/20" :
                            "bg-red-950/20 text-red-400 border-red-500/20"
                          }`}>
                            {selectedStaffLog.choreStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">Incharge Score</span>
                          <div className="flex gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-3.5 w-3.5 ${star <= selectedStaffLog.performanceRating ? "text-amber-400 fill-amber-400" : "text-white/10"}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-white/30 block font-mono">Confidential Clinical Assessment</span>
                        <p className="text-xs text-white/90 leading-relaxed font-sans bg-black/20 p-3 rounded-xl border border-white/5">
                          {selectedStaffLog.confidentialRemarks}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4">
                      <button
                        onClick={() => {
                          setStaffName(selectedStaffLog.staffName);
                          setStaffRole(selectedStaffLog.role);
                          setStaffChoreStatus(selectedStaffLog.choreStatus);
                          setStaffPerformance(selectedStaffLog.performanceRating);
                          setStaffRemarks(selectedStaffLog.confidentialRemarks);
                          setIsCreatingStaffLog(true);
                          setStaffLogs(staffLogs.filter(s => s.id !== selectedStaffLog.id));
                        }}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition text-xs cursor-pointer"
                      >
                        Edit Evaluation
                      </button>
                      <button
                        onClick={() => setSelectedStaffLog(null)}
                        className="px-4 py-2 rounded-xl bg-[#1A1D23] hover:opacity-90 border border-white/5 text-white/50 transition text-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/30 text-center py-12">
                    <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-3 text-[#4ADE80]">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="font-medium text-white/80 text-sm tracking-wider uppercase">Confidential Staff Records</h3>
                    <p className="text-xs text-white/40 mt-1 max-w-xs">Audit duty logs, nursing chore compliance, stubborn attitudes, and clinical scores.</p>
                    <button
                      onClick={() => setIsCreatingStaffLog(true)}
                      className="mt-4 px-4 py-1.5 rounded-full bg-[#8E7AB5]/10 hover:bg-[#8E7AB5]/20 text-xs text-[#B4D4FF] border border-[#8E7AB5]/20 transition cursor-pointer"
                    >
                      Audit Shift Personnel
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* --- VIEWSPACE: SECURITY, DIAGNOSTICS & BACKUPS --- */}
        {activeSubTab === "security" && (
          <div className="flex-1 bg-white/[0.005] p-6 overflow-y-auto text-left">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Header Title */}
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#4ADE80]" /> Cryptographic Vault Security Control
                </h2>
                <p className="text-xs text-white/40 mt-1">Zero-Knowledge client architecture powered by military-grade AES-GCM 256-bit encryption key derivation.</p>
              </div>

              {/* Grid with Diagnostic Metrics and Emergency Export/Import */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Visual Security Health Widget */}
                <div className="p-5 rounded-3xl bg-[#121417] border border-white/5 space-y-4">
                  <span className="text-[9px] uppercase tracking-wider text-[#B4D4FF] font-mono block">Vault Diagnostics Indicator</span>
                  
                  <div className="space-y-3 font-mono text-[11px] text-white/60">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>Cryptographic Key:</span>
                      <span className="text-[#4ADE80] font-bold">Unsealed (Derived)</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>Derived KDF:</span>
                      <span>PBKDF2-HMAC-SHA256</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>KDF Iterations:</span>
                      <span className="text-white/80">100,000 passes</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span>Security Entropies:</span>
                      <span className="text-[#4ADE80] font-bold">High (384-bit Salt)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secure DBs Hooked:</span>
                      <span className="text-white/90">03 Encrypted Lists</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#8E7AB5]/10 border border-[#8E7AB5]/15 rounded-2xl text-[10.5px] text-[#B4D4FF] leading-relaxed">
                    <Info className="h-4 w-4 text-[#B4D4FF] float-left mr-2 mt-0.5" />
                    All database keys and items remain strictly in-memory. Locking the OS destroys all derived keys instantly from session cache.
                  </div>
                </div>

                {/* Secure Backup & Sync System */}
                <div className="p-5 rounded-3xl bg-[#121417] border border-white/5 space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[#4ADE80] font-mono block">Offline Data Backup (Full Encryption)</span>
                    <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                      Download a fully encrypted backup of your diaries, locker secrets, and staff logs to keep on your local computer or phone.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={handleExportBackup}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] hover:opacity-90 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Export Encrypted Backup
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 text-[#B4D4FF]" /> Import Secure Backup
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportBackup}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Change Vault Passphrase Module */}
              <div className="p-5 rounded-3xl bg-[#121417] border border-white/5 space-y-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-amber-400 font-mono block">Change Vault-Specific Passphrase</span>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Set a unique password specifically for this Incharge Secret Vault. Changing this will automatically decrypt your journals, keys, and staff logs under the old key, and re-encrypt everything under the new key instantly in your browser storage.
                  </p>
                </div>

                <form onSubmit={handleChangeVaultPassword} className="space-y-4 max-w-md">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-mono">Current Passphrase</label>
                      <input
                        type="password"
                        required
                        value={currentPass}
                        onChange={(e) => {
                          setCurrentPass(e.target.value);
                          setPasswordChangeError("");
                          setPasswordChangeSuccess("");
                        }}
                        placeholder="Current passphrase..."
                        className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-mono">New Passphrase</label>
                        <input
                          type="password"
                          required
                          value={newPass}
                          onChange={(e) => {
                            setNewPass(e.target.value);
                            setPasswordChangeError("");
                            setPasswordChangeSuccess("");
                          }}
                          placeholder="New secret passphrase..."
                          className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-mono">Confirm New Passphrase</label>
                        <input
                          type="password"
                          required
                          value={confirmNewPass}
                          onChange={(e) => {
                            setConfirmNewPass(e.target.value);
                            setPasswordChangeError("");
                            setPasswordChangeSuccess("");
                          }}
                          placeholder="Confirm new passphrase..."
                          className="w-full bg-[#1A1D23] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#8E7AB5]"
                        />
                      </div>
                    </div>
                  </div>

                  {passwordChangeError && (
                    <p className="text-xs text-red-400 font-mono flex items-center gap-1">
                      <ShieldAlert className="h-3.5 w-3.5" /> {passwordChangeError}
                    </p>
                  )}
                  {passwordChangeSuccess && (
                    <p className="text-xs text-[#4ADE80] font-mono flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> {passwordChangeSuccess}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 transition text-xs font-bold cursor-pointer"
                    >
                      🔒 Modify Vault Passphrase
                    </button>
                  </div>
                </form>
              </div>

              {/* Feedback messages from Import/Export */}
              {importError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-red-400">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* Security Panic Self-Destruct */}
              <div className="p-5 rounded-3xl bg-red-950/5 border border-red-500/10 space-y-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-red-400 font-mono block flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 animate-pulse" /> Emergency Security Level Wiping
                  </span>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    If someone forces you to yield your password, or in case of terminal compromise, you can execute a full local storage wipe. This permanently destroys all secure diaries, codes, and audits on this disk.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm("🚨 WARNING: THIS WILL WIPE ALL ENCRYPTED DATA PERMANENTLY! There is no recovery. Proceed?")) {
                        localStorage.clear();
                        alert("Cryptographic environment successfully zeroed out.");
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/30 border border-red-500/20 text-red-300 transition text-xs cursor-pointer font-bold"
                  >
                    Wipe Entire secure storage
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
