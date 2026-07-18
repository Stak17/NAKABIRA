import React, { useState } from "react";
import LockScreen from "./components/LockScreen";
import Desktop from "./components/Desktop";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");

  const handleUnlock = (password: string) => {
    setMasterPassword(password);
    setIsUnlocked(true);
  };

  const handleLock = () => {
    setMasterPassword("");
    setIsUnlocked(false);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-slate-950">
      {isUnlocked ? (
        <Desktop masterPassword={masterPassword} onLock={handleLock} />
      ) : (
        <LockScreen onUnlock={handleUnlock} />
      )}
    </div>
  );
}
