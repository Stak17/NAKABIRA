import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, AlertCircle, Heart, Trash2, Shield, MessageSquareCode, Sliders } from "lucide-react";
import { AIChatMessage } from "../types";
import { encryptText, decryptText } from "../lib/crypto";

interface CompanionAppProps {
  masterPassword?: string;
  isUnlocked: boolean;
}

export default function CompanionApp({ masterPassword, isUnlocked }: CompanionAppProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // Custom interactive trait
  const [stubbornLevel, setStubbornLevel] = useState(3); // 1 = Angelic, 3 = Normal, 5 = Max Stubborn

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    if (isUnlocked && masterPassword) {
      loadChatHistory();
    }
  }, [isUnlocked, masterPassword]);

  // Scroll to bottom on messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadChatHistory = async () => {
    setIsDecrypting(true);
    setStatusMsg("Deriving keys and decrypting private chat database...");
    try {
      const rawEncryptedHistory = localStorage.getItem("jojo_secure_chat_v1");
      if (!rawEncryptedHistory) {
        // Initialize with default introductory message
        const welcomeMessage: AIChatMessage = {
          id: "welcome",
          role: "model",
          text: "Welcome back, Musawo Joan. 🕊️\n\nI am your private GraceCompanion. As a dedicated medic at Anna Grace Medical Center, your days are long (Monday to Saturday, with those heavy Thursday-Friday night shifts), and your load is heavy.\n\nWhether you feel peaceful, exhausted, or delightfully stubborn today, your thoughts and secrets are safe here with me—client-side encrypted so they never leak. How can I pray for you or support your clinical day today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([welcomeMessage]);
        await saveEncryptedChat([welcomeMessage]);
      } else {
        const encryptedList = JSON.parse(rawEncryptedHistory) as { id: string; role: string; encryptedText: string; timestamp: string }[];
        const decryptedList: AIChatMessage[] = [];
        
        for (const item of encryptedList) {
          try {
            const text = await decryptText(item.encryptedText, masterPassword!);
            decryptedList.push({
              id: item.id,
              role: item.role as "user" | "model",
              text,
              timestamp: item.timestamp
            });
          } catch (e) {
            console.error("Individual chat message decryption failed:", e);
          }
        }
        setMessages(decryptedList);
      }
      setStatusMsg("");
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setStatusMsg("Decrypt error: Secure chat vault locked.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const saveEncryptedChat = async (plainMessages: AIChatMessage[]) => {
    if (!masterPassword) return;
    try {
      const encryptedItems = [];
      for (const msg of plainMessages) {
        // We skip encrypting the static welcome message if we want to save space, but encrypting everything is safer
        const encryptedText = await encryptText(msg.text, masterPassword);
        encryptedItems.push({
          id: msg.id,
          role: msg.role,
          timestamp: msg.timestamp,
          encryptedText
        });
      }
      localStorage.setItem("jojo_secure_chat_v1", JSON.stringify(encryptedItems));
    } catch (err) {
      console.error("Encryption of chat history failed:", err);
      setStatusMsg("Error securing conversation history.");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || inputMessage;
    if (!content.trim() || isLoading) return;

    if (!textToSend) setInputMessage("");

    // 1. Add user message
    const userMsg: AIChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedWithUser = [...messages, userMsg];
    setMessages(updatedWithUser);
    setIsLoading(true);

    // Prepare stubborn text context
    const stubbornText = 
      stubbornLevel === 1 ? "Completely cooperative and gentle" :
      stubbornLevel === 2 ? "Moderately soft" :
      stubbornLevel === 3 ? "Standard principled" :
      stubbornLevel === 4 ? "Unusually resolute and secretive" :
      "MAXIMUM STUBBORN (Principled but highly stubborn, secret, challenging, but completely down to earth!)";

    try {
      // 2. Call backend proxy endpoint
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          // Only send the last few messages for token budget
          history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
          userName: "Musawo Joan",
          userState: `Feeling: ${stubbornText}. Shift schedule: Working Monday to Saturday, Friday transition night shifts.`
        })
      });

      const data = await response.json();

      const aiMsg: AIChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedWithUser, aiMsg];
      setMessages(finalMessages);
      await saveEncryptedChat(finalMessages);
    } catch (err) {
      console.error("AI Communication failed:", err);
      // Fallback response
      const aiMsg: AIChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: "Musawo Joan, I was unable to connect to the server. But I am still with you. Remember: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' (Joshua 1:9). Protect your heart tonight.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...updatedWithUser, aiMsg];
      setMessages(finalMessages);
      await saveEncryptedChat(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (confirm("Permanently incinerate all chat logs? This mathematically wipes the records from this device.")) {
      const welcome: AIChatMessage = {
        id: "welcome",
        role: "model",
        text: "Database purged successfully. Zero-knowledge logging resumed. I am listening, Musawo Joan.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([welcome]);
      await saveEncryptedChat([welcome]);
    }
  };

  const handleQuickPrompt = (type: string) => {
    if (type === "tired") {
      handleSendMessage("I am exhausted after my hospital duties. Can you pray a quick prayer of strength for me?");
    } else if (type === "stubborn") {
      handleSendMessage("I am feeling incredibly stubborn today, and people are finding it difficult. Tell me why being principled is beautiful, but pray for my peace.");
    } else if (type === "patients") {
      handleSendMessage("We have some very difficult and stubborn patients at Anna Grace clinic today. Give me medical wisdom and prayer to handle them with grace.");
    } else {
      handleSendMessage("Give me a deep, secretive meditation for my quiet moments of prayer.");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-slate-200">
      {/* Encryption Header Banner */}
      <div className="flex items-center justify-between border-b border-rose-500/10 bg-rose-950/20 px-4 py-2 text-xs text-rose-300">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Double-Envelope Client AES Encrypted DB</span>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 hover:text-red-400 text-slate-400 font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded cursor-pointer transition border border-slate-800"
        >
          <Trash2 className="h-3 w-3" />
          Purge Chat
        </button>
      </div>

      {statusMsg && (
        <div className="bg-slate-900 px-4 py-1 text-center text-xs text-amber-300">
          {statusMsg}
        </div>
      )}

      {/* Trait Slider Control Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="h-3.5 w-3.5 text-rose-400" />
          <span className="font-semibold text-slate-300">Stubborn Joan Calibration:</span>
          <span className="font-mono text-rose-300 font-bold">
            {stubbornLevel === 1 ? "Cooperatively Sweet" :
             stubbornLevel === 2 ? "Gentle Medic" :
             stubbornLevel === 3 ? "Standard Principled" :
             stubbornLevel === 4 ? "stubborn & Proud" :
             "MAX STUBBORN (Musawo Supreme)"}
          </span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-48">
          <span className="text-[10px] text-slate-500">Angelic</span>
          <input
            type="range"
            min="1"
            max="5"
            value={stubbornLevel}
            onChange={(e) => setStubbornLevel(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <span className="text-[10px] text-slate-500">Stubborn</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isDecrypting ? (
          <div className="py-12 text-center text-slate-400">
            <div className="animate-spin h-6 w-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-xs">Unsealing AI conversation database...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-2 max-w-2xl ${
                  isUser ? "ml-auto" : "mr-auto"
                }`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-full bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Heart className="h-4 w-4 text-emerald-400" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl leading-relaxed text-slate-200 text-xs sm:text-sm whitespace-pre-wrap ${
                    isUser
                      ? "bg-rose-600/20 border border-rose-500/20 rounded-tr-none text-right"
                      : "bg-slate-900/60 border border-slate-800 rounded-tl-none text-left"
                  }`}>
                    {msg.text}
                  </div>
                  <span className={`text-[9px] text-slate-500 font-mono block ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-full bg-rose-900/40 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-rose-400" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex justify-start items-center gap-2 max-w-md">
            <div className="h-7 w-7 rounded-full bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            </div>
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl rounded-tl-none">
              <div className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                <span className="text-xs text-slate-400 ml-1.5">GraceCompanion is praying & formulating counsel...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts Grid */}
      {messages.length <= 1 && (
        <div className="p-3 bg-slate-900/20 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickPrompt("tired")}
            className="p-2 text-left bg-slate-900/50 hover:bg-slate-900 hover:border-rose-500/30 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            🔋 Strength for Fatigue
          </button>
          <button
            onClick={() => handleQuickPrompt("stubborn")}
            className="p-2 text-left bg-slate-900/50 hover:bg-slate-900 hover:border-rose-500/30 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            🦁 My Stubborn Vibe
          </button>
          <button
            onClick={() => handleQuickPrompt("patients")}
            className="p-2 text-left bg-slate-900/50 hover:bg-slate-900 hover:border-rose-500/30 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            🏥 Patient Patience Prayer
          </button>
          <button
            onClick={() => handleQuickPrompt("secret")}
            className="p-2 text-left bg-slate-900/50 hover:bg-slate-900 hover:border-rose-500/30 border border-slate-800 rounded-lg transition cursor-pointer"
          >
            🕊️ Secretive Meditation
          </button>
        </div>
      )}

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Musawo, chat with GraceCompanion... All logs are client-side encrypted."
          className="flex-1 bg-slate-950 border border-slate-700/60 rounded-xl p-2 px-3 text-slate-100 focus:outline-none focus:border-rose-500 text-xs sm:text-sm"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-rose-950/20"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
