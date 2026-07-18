/**
 * Zero-Knowledge Client-Side Cryptographic Utilities
 * Designed to encrypt Joan's secretive diaries, medical logs, and AI conversations.
 * Everything is encrypted in-browser using AES-GCM 256-bit with PBKDF2 key derivation.
 * The master password never leaves her browser.
 */

// Helper: Convert ArrayBuffer to Hex String
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper: Convert Hex String to ArrayBuffer
function hexToBuffer(hexString: string): ArrayBuffer {
  const result = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    result[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return result.buffer;
}

// Helper: Convert String to ArrayBuffer
function stringToBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Helper: Convert ArrayBuffer to String
function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Derives a CryptoKey from a master password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    stringToBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey", "deriveBits"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false, // key is not extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext string using a master password
 * Returns JSON-safe payload containing hex representation of: { iv, salt, ciphertext }
 */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      stringToBuffer(plaintext)
    );

    const payload = {
      salt: bufferToHex(salt),
      iv: bufferToHex(iv),
      ciphertext: bufferToHex(ciphertextBuffer)
    };

    return JSON.stringify(payload);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to secure content");
  }
}

/**
 * Decrypts a payload string back to plaintext using the master password
 */
export async function decryptText(encryptedPayload: string, password: string): Promise<string> {
  try {
    const { salt, iv, ciphertext } = JSON.parse(encryptedPayload);
    
    const saltBuffer = hexToBuffer(salt);
    const ivBuffer = hexToBuffer(iv);
    const ciphertextBuffer = hexToBuffer(ciphertext);
    
    const key = await deriveKey(password, new Uint8Array(saltBuffer));
    
    const plaintextBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer)
      },
      key,
      ciphertextBuffer
    );

    return bufferToString(plaintextBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid password or corrupted data");
  }
}

/**
 * Quick verification of a password against a local test payload
 */
export async function verifyMasterPassword(password: string, testPayload: string): Promise<boolean> {
  try {
    const decrypted = await decryptText(testPayload, password);
    return decrypted === "JOJO_OS_KEY_CHECK";
  } catch {
    return false;
  }
}

/**
 * Create a security verification hash for a new password
 */
export async function createPasswordCheckPayload(password: string): Promise<string> {
  return await encryptText("JOJO_OS_KEY_CHECK", password);
}
