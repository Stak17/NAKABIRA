import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Bell, Clock, Sun, Moon, Sparkles, Heart, CheckSquare, ShieldCheck, Play } from "lucide-react";
import { DevotionalSnippet } from "../types";

export default function SchedulerApp() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  
  // Custom states
  const [alertSettings, setAlertSettings] = useState({
    morningGrace: true,
    thursdayVigil: true,
    fridayMorningMercy: true,
    saturdaySabbathPrep: true,
  });

  // Checklist states
  const [checklists, setChecklists] = useState<Record<string, boolean>>({
    prayerWisdom: false,
    stubbornPatience: false,
    breathRefuge: false,
  });

  // Live timer update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine current scheduled event based on her real weekly layout
  const getCurrentRhythm = () => {
    const day = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    const hour = currentTime.getHours();

    // Thursday Night Shift to Friday Night Shift
    // Thursday Night starts around 8:00 PM (20) to Friday morning
    if (day === 4 && hour >= 20) {
      return {
        status: "Hospital Night Shift Active 🩺",
        center: "Anna Grace Medical Center",
        color: "bg-purple-950/40 border-purple-500/30 text-purple-200",
        desc: "Active duty. Thursday Night Vigil. Keep your spirit strong, Musawo Joan!",
        scripture: "Psalm 121:3-4 - 'He will not let your foot slip—he who watches over you will not slumber.'"
      };
    }
    if (day === 5) {
      // Friday whole day (she has a continuous transition/shift Friday night too)
      return {
        status: "Hospital Shift & Friday Night Duty 🏥",
        center: "Anna Grace Medical Center",
        color: "bg-indigo-950/40 border-indigo-500/30 text-indigo-200",
        desc: "Friday Duty transition. Heavy workload. Breathe and trust in God's wings.",
        scripture: "Galatians 6:9 - 'Let us not become weary in doing good, for at the proper time we will reap a harvest.'"
      };
    }
    if (day === 0) {
      // Sunday is Rest / Devotions
      return {
        status: "Sabbath Rest & Quiet Worship 🕊️",
        center: "Rest & Spiritual Recharge",
        color: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
        desc: "Weekly Rest. No clinic shifts. Recharging your secretive, beautiful soul.",
        scripture: "Matthew 11:28 - 'Come to me, all you who are weary and burdened, and I will give you rest.'"
      };
    }
    // Monday to Saturday (except specific Friday shift coverage already caught, Saturday ends around 6 PM)
    if (day >= 1 && day <= 6) {
      if (hour >= 8 && hour < 17) {
        return {
          status: "Standard Medic Duty Hour 🩺",
          center: "Anna Grace Medical Center",
          color: "bg-blue-950/40 border-blue-500/30 text-blue-200",
          desc: "Day shifts are busy. Take small moments to pray silently between patients.",
          scripture: "Colossians 3:23 - 'Whatever you do, work at it with all your heart, as working for the Lord.'"
        };
      } else {
        return {
          status: "Work Complete - Evening Rest ☕",
          center: "Personal Sanctuary",
          color: "bg-amber-950/40 border-amber-500/30 text-amber-200",
          desc: "Shift ended. Time to rest your physical body, read scripture, and enjoy simple peace.",
          scripture: "Psalm 4:8 - 'In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety.'"
        };
      }
    }

    return {
      status: "Personal Sanctuary Hour 🌿",
      center: "Home Sanctuary",
      color: "bg-slate-950/40 border-slate-500/30 text-slate-200",
      desc: "Quiet hours. Perfect for secret diaries and heartfelt prayer.",
      scripture: "Psalm 46:10 - 'Be still, and know that I am God.'"
    };
  };

  const currentRhythm = getCurrentRhythm();

  const toggleAlert = (key: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerTestAlert = (type: string) => {
    let alertDetails = {
      title: "",
      scripture: "",
      content: "",
      audioVibe: ""
    };

    if (type === "thursday") {
      alertDetails = {
        title: "🌌 Night Watch Medic Vigil",
        scripture: "Psalm 119:148 - 'My eyes stay open through the watches of the night, that I may meditate on your promises.'",
        content: "Musawo Joan, the night shifts can be cold and challenging. When the patients are sleeping and fatigue creeps in, let this moment be your altar. God is looking down upon your healing hands at Anna Grace. Breathe in His power.",
        audioVibe: "Instrumental Calm Worship Piano"
      };
    } else if (type === "friday") {
      alertDetails = {
        title: "🌅 Friday Morning Mercy",
        scripture: "Lamentations 3:22-23 - 'Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning.'",
        content: "Musawo Joan, you made it through the long night hours. Praise God for His endurance! Rest is coming. Thank Him for preserving your patient focus and giving you stubborn strength.",
        audioVibe: "Soft Morning Guitar & Ocean Waves"
      };
    } else if (type === "saturday") {
      alertDetails = {
        title: "🌾 Saturday Sabbath Eve Prep",
        scripture: "Genesis 2:3 - 'And God blessed the seventh day and made it holy...'",
        content: "Your working week (Monday to Saturday) is coming to a beautiful close. Wash your hands of the clinical stress, lock up your records, and prepare your heart for the sacred Sunday rest. You have done incredibly well.",
        audioVibe: "Peaceful Flute and Forest Rain"
      };
    } else {
      alertDetails = {
        title: "☀️ Morning Grace & Healing Hands",
        scripture: "Luke 9:2 - 'And He sent them to preach the kingdom of God and to heal the sick.'",
        content: "A medic's day is busy, full of demands and complicated patients at Anna Grace. Pray for patience, wisdom, and a calm spirit today. Let your beautiful smile be a beacon of hope to those in pain.",
        audioVibe: "Ambient Sunrise Pads"
      };
    }

    setActiveAlert(alertDetails);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden text-sm text-slate-200">
      {/* Encryption Header Banner */}
      <div className="flex items-center justify-between border-b border-emerald-500/10 bg-emerald-950/20 px-4 py-2 text-xs text-emerald-300">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Musawo Joan's Schedule Synced Successfully</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <Clock className="h-3 w-3" />
          <span>Devotion Alert Engine Active</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top Section: Rhythm Status Bar */}
        <div className={`p-4 rounded-xl border ${currentRhythm.color} transition-all duration-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 bg-slate-900/60 rounded-full border border-slate-700/30">
                Current Rhythm
              </span>
              <span className="font-semibold text-emerald-400 text-xs flex items-center gap-1">
                <Heart className="h-3 w-3 fill-emerald-400" />
                Anna Grace Clinician Sync
              </span>
            </div>
            <h2 className="text-lg font-display font-bold">{currentRhythm.status}</h2>
            <p className="text-slate-300 text-xs max-w-lg leading-relaxed">{currentRhythm.desc}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex flex-col items-center justify-center min-w-[140px]">
            <span className="text-slate-400 text-[10px] font-mono">LIVE TIMER</span>
            <span className="text-base font-bold font-mono mt-0.5 text-slate-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Rhythm Details & Daily Scripture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sunday to Saturday Weekly Visualizer */}
          <div className="p-4 rounded-xl glass-panel space-y-3">
            <h3 className="font-display font-medium text-slate-300 flex items-center gap-2 text-xs">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Musawo Joan's Work & Shift Layout
            </h3>
            
            <div className="grid grid-cols-7 gap-1 text-center py-2">
              {[
                { label: "S", key: 0, desc: "Rest", active: currentTime.getDay() === 0 },
                { label: "M", key: 1, desc: "Duty", active: currentTime.getDay() === 1 },
                { label: "T", key: 2, desc: "Duty", active: currentTime.getDay() === 2 },
                { label: "W", key: 3, desc: "Duty", active: currentTime.getDay() === 3 },
                { label: "T", key: 4, desc: "Night", active: currentTime.getDay() === 4 },
                { label: "F", key: 5, desc: "Night", active: currentTime.getDay() === 5 },
                { label: "S", key: 6, desc: "Duty", active: currentTime.getDay() === 6 },
              ].map((day, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                    day.active
                      ? "bg-emerald-600/30 border-emerald-400/60 text-white scale-105 shadow-md shadow-emerald-900/10"
                      : "bg-slate-900/40 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="font-bold text-xs font-display">{day.label}</span>
                  <span className="text-[8px] uppercase tracking-tighter mt-1 font-mono">
                    {day.desc}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Clinical Days:</span>
                <span className="text-slate-200">Monday - Saturday (Anna Grace)</span>
              </div>
              <div className="flex justify-between">
                <span>Vigil Duty shifts:</span>
                <span className="text-purple-300 font-semibold">Thursday Night 8PM - Friday Night 10PM</span>
              </div>
              <div className="flex justify-between">
                <span>Personal Devotional Day:</span>
                <span className="text-emerald-300 font-semibold">Sunday Sabbath Rest</span>
              </div>
            </div>
          </div>

          {/* Core Daily Devotional Card */}
          <div className="p-4 rounded-xl glass-panel space-y-3 bg-gradient-to-br from-emerald-950/10 to-slate-900/50 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Active Devotional Anchor
              </span>
              <p className="font-serif italic text-base leading-relaxed text-slate-200 font-medium">
                "{currentRhythm.scripture.split(" - ")[1]}"
              </p>
              <p className="text-xs text-slate-400 font-mono text-right">
                — {currentRhythm.scripture.split(" - ")[0]}
              </p>
            </div>
            
            <div className="border-t border-slate-800/80 pt-2.5 mt-2 flex justify-between items-center text-xs">
              <span className="text-slate-400">Perfect for: <span className="text-slate-300">{currentRhythm.status}</span></span>
              <button
                onClick={() => triggerTestAlert("morning")}
                className="text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" /> Devotional Hour
              </button>
            </div>
          </div>
        </div>

        {/* Personalized Devotion Notifications Toggling & Test Bench */}
        <div className="p-4 rounded-xl glass-panel space-y-3">
          <h3 className="font-display font-medium text-slate-300 flex items-center gap-2 text-xs">
            <Bell className="h-4 w-4 text-rose-400 animate-pulse" />
            Personalized Devotion Alerts
          </h3>
          <p className="text-xs text-slate-400">Configure or test beautiful notifications designed for Musawo Joan's medical work rhythms and secretive faith.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            {[
              {
                id: "morningGrace",
                title: "Healing Hands Duty Alert",
                time: "Daily 7:30 AM",
                icon: <Sun className="h-4 w-4 text-amber-400" />,
                type: "morning"
              },
              {
                id: "thursdayVigil",
                title: "Night Shift Vigil Alert",
                time: "Thursday 11:00 PM",
                icon: <Moon className="h-4 w-4 text-purple-400" />,
                type: "thursday"
              },
              {
                id: "fridayMorningMercy",
                title: "Night Shift End Mercy Alert",
                time: "Friday 6:30 AM",
                icon: <Sparkles className="h-4 w-4 text-teal-400" />,
                type: "friday"
              },
              {
                id: "saturdaySabbathPrep",
                title: "Sabbath Preparation Alert",
                time: "Saturday 6:00 PM",
                icon: <Heart className="h-4 w-4 text-rose-400" />,
                type: "saturday"
              }
            ].map(item => (
              <div key={item.id} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col justify-between gap-3 text-left">
                <div className="flex justify-between items-start">
                  <div className="p-1.5 bg-slate-950/80 rounded border border-slate-800">
                    {item.icon}
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(alertSettings as any)[item.id]}
                      onChange={() => toggleAlert(item.id as any)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white peer-checked:after:border-emerald-500"></div>
                  </label>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-200 truncate">{item.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{item.time}</span>
                </div>
                <button
                  onClick={() => triggerTestAlert(item.type)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 rounded bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition font-medium cursor-pointer"
                >
                  <Play className="h-2.5 w-2.5 text-slate-400" />
                  Trigger Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Devotion Alarm Overlay (Popup Screen) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-md w-full space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="text-amber-400 text-xs font-mono tracking-widest uppercase block">
                  🕊️ Musawo Joan's Sacred Space
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-100">{activeAlert.title}</h2>
                <div className="h-[2px] w-20 bg-emerald-500/40 mx-auto rounded-full"></div>
              </div>

              {/* Glowing visual element */}
              <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-emerald-500/5 rounded-full animate-pulse"></div>
                <div className="relative p-5 bg-slate-900 border border-emerald-500/30 rounded-full shadow-lg">
                  <Heart className="h-10 w-10 text-emerald-400 fill-emerald-500/10 animate-pulse" />
                </div>
              </div>

              {/* Devotional content */}
              <div className="space-y-4 text-left p-5 bg-slate-900/60 border border-slate-800 rounded-xl leading-relaxed">
                <p className="font-serif italic text-base text-amber-300 border-b border-slate-800 pb-2.5">
                  "{activeAlert.scripture.split(" - ")[1]}"
                  <span className="block text-xs font-mono text-slate-400 text-right mt-1.5">— {activeAlert.scripture.split(" - ")[0]}</span>
                </p>
                
                <p className="text-xs text-slate-300 font-sans">{activeAlert.content}</p>

                {/* Secretive Clinical Devotional Checklist */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">MEDIC SOUL CHECKLIST</span>
                  <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklists.prayerWisdom}
                      onChange={() => setChecklists(prev => ({ ...prev, prayerWisdom: !prev.prayerWisdom }))}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 h-3.5 w-3.5"
                    />
                    <span>Breathed in grace & claimed medical wisdom</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklists.stubbornPatience}
                      onChange={() => setChecklists(prev => ({ ...prev, stubbornPatience: !prev.stubbornPatience }))}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 h-3.5 w-3.5"
                    />
                    <span>Prayed for infinite patience with stubborn patients</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklists.breathRefuge}
                      onChange={() => setChecklists(prev => ({ ...prev, breathRefuge: !prev.breathRefuge }))}
                      className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0 h-3.5 w-3.5"
                    />
                    <span>Reminded my secretive soul that God is my refuge</span>
                  </label>
                </div>
              </div>

              {/* Close Button / Close devotion */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setActiveAlert(null);
                    // Reset checklists
                    setChecklists({
                      prayerWisdom: false,
                      stubbornPatience: false,
                      breathRefuge: false,
                    });
                  }}
                  className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition cursor-pointer text-xs"
                >
                  Conclude Devotion & Return to Shift
                </button>
                <span className="text-[10px] text-slate-500 font-mono flex justify-center items-center gap-1">
                  🎵 Recommended background vibe: {activeAlert.audioVibe}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
