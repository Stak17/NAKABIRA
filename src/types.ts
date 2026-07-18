/**
 * Shared Type Definitions for JoJo OS
 */

export interface EncryptedPayload {
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string; // Plaintext when in-memory, stored as encrypted string
  mood: "Stubborn" | "Peaceful" | "Exhausted" | "Anxious" | "Grateful" | "Prayer Mode";
  category: "Personal" | "Medic Devotion" | "Secret Reflection" | "Anna Grace Note";
}

export interface PatientLog {
  id: string;
  patientInitials: string;
  vitals: string; // e.g., "BP 120/80, HR 72"
  stubbornnessLevel: number; // 1 to 5 (playful)
  note: string; // Plaintext when in-memory, stored as encrypted string
  timestamp: string;
}

export interface DevotionNotification {
  id: string;
  title: string;
  verse: string;
  content: string;
  time: string;
  type: "Night Shift Focus" | "Morning Grace" | "Sabbath Rest" | "Daily Strength";
  triggeredAt?: string;
  read: boolean;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface DevotionalSnippet {
  title: string;
  scripture: string;
  meditation: string;
  prayer: string;
}

export interface VaultCredential {
  id: string;
  label: string;
  username?: string;
  secret: string;
  notes?: string;
  category: "Lock Code" | "Login" | "Override Key" | "Personal" | "Other";
  updatedAt: string;
}

export interface StaffLog {
  id: string;
  staffName: string;
  role: "Nurse" | "Clinical Officer" | "Lab Tech" | "Intern" | "Admin";
  choreStatus: "Completed" | "Incomplete" | "Stubbornly Refused";
  performanceRating: number;
  confidentialRemarks: string;
  date: string;
}
