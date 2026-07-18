import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, 
  BookOpen, Sparkles, RefreshCw, Shuffle, Heart, Radio, Flame
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: "Hymn" | "Praise" | "Instrumental" | "Worship";
  scripture: string;
  lyrics: string[];
}

const GOSPEL_PLAYLIST: Track[] = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    artist: "Classic Choral & Organ Ensemble",
    url: "https://archive.org/download/AmazingGrace_714/AmazingGrace.mp3",
    category: "Hymn",
    scripture: "Ephesians 2:8 — 'For by grace you have been saved through faith.'",
    lyrics: [
      "Amazing grace! How sweet the sound",
      "That saved a wretch like me!",
      "I once was lost, but now am found;",
      "Was blind, but now I see.",
      "'Twas grace that taught my heart to fear,",
      "And grace my fears relieved;",
      "How precious did that grace appear",
      "The hour I first believed.",
      "Through many dangers, toils and snares,",
      "I have already come;",
      "'Twas grace hath brought me safe thus far,",
      "And grace will lead me home."
    ]
  },
  {
    id: "it-is-well",
    title: "It Is Well With My Soul",
    artist: "Peaceful Piano & Strings Ensemble",
    url: "https://archive.org/download/classic-hymns-instrumental/It_Is_Well_With_My_Soul_64kb.mp3",
    category: "Instrumental",
    scripture: "Philippians 4:7 — 'And the peace of God, which transcends all understanding, will guard your hearts.'",
    lyrics: [
      "When peace like a river, attendeth my way,",
      "When sorrows like sea billows roll;",
      "Whatever my lot, Thou hast taught me to say,",
      "It is well, it is well, with my soul.",
      "Though Satan should buffet, though trials should come,",
      "Let this blest assurance control,",
      "That Christ has regarded my helpless estate,",
      "And hath shed His own blood for my soul.",
      "It is well (it is well),",
      "With my soul (with my soul),",
      "It is well, it is well, with my soul."
    ]
  },
  {
    id: "be-thou-my-vision",
    title: "Be Thou My Vision",
    artist: "Acoustic Devotional Guitar",
    url: "https://archive.org/download/classic-hymns-instrumental/Be_Thou_My_Vision_64kb.mp3",
    category: "Worship",
    scripture: "Hebrews 12:2 — 'Fixing our eyes on Jesus, the pioneer and perfecter of faith.'",
    lyrics: [
      "Be Thou my Vision, O Lord of my heart;",
      "Naught be all else to me, save that Thou art;",
      "Thou my best thought, by day or by night,",
      "Waking or sleeping, Thy presence my light.",
      "Be Thou my Wisdom, and Thou my true Word;",
      "I ever with Thee and Thou with me, Lord;",
      "Thou my great Father, and I Thy true son;",
      "Thou in me dwelling, and I with Thee one."
    ]
  },
  {
    id: "blessed-assurance",
    title: "Blessed Assurance",
    artist: "Symphonic Organ & Brass",
    url: "https://archive.org/download/classic-hymns-instrumental/Blessed_Assurance_64kb.mp3",
    category: "Hymn",
    scripture: "Hebrews 10:22 — 'Let us draw near to God with a sincere heart and with the full assurance that faith brings.'",
    lyrics: [
      "Blessed assurance, Jesus is mine!",
      "Oh, what a foretaste of glory divine!",
      "Heir of salvation, purchase of God,",
      "Born of His Spirit, washed in His blood.",
      "This is my story, this is my song,",
      "Praising my Savior all the day long;",
      "This is my story, this is my song,",
      "Praising my Savior all the day long."
    ]
  },
  {
    id: "abide-with-me",
    title: "Abide With Me",
    artist: "Celestial Chamber Strings",
    url: "https://archive.org/download/classic-hymns-instrumental/Abide_With_Me_64kb.mp3",
    category: "Instrumental",
    scripture: "Luke 24:29 — 'But they urged him strongly, saying, \"Abide with us, for it is toward evening.\"'",
    lyrics: [
      "Abide with me; fast falls the eventide;",
      "The darkness deepens; Lord with me abide.",
      "When other helpers fail and comforts flee,",
      "Help of the helpless, O abide with me.",
      "Swift to its close ebbs out life's little day;",
      "Earth's joys grow dim; its glories pass away;",
      "Change and decay in all around I see;",
      "O Thou who changest not, abide with me."
    ]
  },
  {
    id: "jesus-friend",
    title: "What A Friend We Have In Jesus",
    artist: "Acoustic Piano & Flute",
    url: "https://archive.org/download/classic-hymns-instrumental/What_A_Friend_We_Have_In_Jesus_64kb.mp3",
    category: "Praise",
    scripture: "John 15:15 — 'I have called you friends, for everything that I learned from my Father I have made known to you.'",
    lyrics: [
      "What a friend we have in Jesus,",
      "All our sins and griefs to bear!",
      "What a privilege to carry",
      "Everything to God in prayer!",
      "O what peace we often forfeit,",
      "O what needless pain we bear,",
      "All because we do not carry",
      "Everything to God in prayer."
    ]
  }
];

const MELODIES: Record<string, [number, number, string][]> = {
  "amazing-grace": [
    [261.63, 0.8, "C4"],
    [349.23, 1.6, "F4"],
    [440.00, 0.4, "A4"],
    [349.23, 0.4, "F4"],
    [440.00, 1.6, "A4"],
    [392.00, 0.8, "G4"],
    [349.23, 1.6, "F4"],
    [293.66, 0.8, "D4"],
    [261.63, 1.6, "C4"],
    [261.63, 0.8, "C4"],
    [349.23, 1.6, "F4"],
    [440.00, 0.4, "A4"],
    [349.23, 0.4, "F4"],
    [440.00, 1.6, "A4"],
    [392.00, 0.8, "G4"],
    [523.25, 2.4, "C5"],
    [440.00, 0.8, "A4"],
    [523.25, 1.6, "C5"],
    [440.00, 0.4, "A4"],
    [523.25, 0.4, "C5"],
    [440.00, 1.6, "A4"],
    [349.23, 0.8, "F4"],
    [261.63, 1.6, "C4"],
    [293.66, 0.8, "D4"],
    [349.23, 1.6, "F4"],
    [349.23, 0.4, "F4"],
    [293.66, 0.4, "D4"],
    [261.63, 1.6, "C4"],
    [349.23, 2.4, "F4"]
  ],
  "it-is-well": [
    [261.63, 1.0, "C4"],
    [261.63, 0.5, "C4"],
    [293.66, 0.5, "D4"],
    [329.63, 1.0, "E4"],
    [349.23, 1.0, "F4"],
    [392.00, 1.0, "G4"],
    [349.23, 0.5, "F4"],
    [329.63, 0.5, "E4"],
    [293.66, 1.0, "D4"],
    [261.63, 1.0, "C4"],
    [392.00, 2.0, "G4"],
    [440.00, 1.0, "A4"],
    [493.88, 1.0, "B4"],
    [523.25, 1.5, "C5"],
    [440.00, 0.5, "A4"],
    [392.00, 1.0, "G4"],
    [349.23, 0.5, "F4"],
    [329.63, 0.5, "E4"],
    [392.00, 2.0, "G4"],
    [392.00, 1.0, "G4"],
    [440.00, 1.5, "A4"],
    [392.00, 0.5, "G4"],
    [349.23, 1.0, "F4"],
    [329.63, 1.0, "E4"],
    [329.63, 1.0, "E4"],
    [293.66, 0.5, "D4"],
    [329.63, 0.5, "E4"],
    [349.23, 1.0, "F4"],
    [293.66, 1.0, "D4"],
    [329.63, 2.0, "E4"]
  ],
  "be-thou-my-vision": [
    [293.66, 1.0, "D4"],
    [293.66, 1.0, "D4"],
    [329.63, 1.0, "E4"],
    [349.23, 1.5, "F4"],
    [329.63, 0.5, "E4"],
    [293.66, 1.0, "D4"],
    [440.00, 1.5, "A4"],
    [493.88, 0.5, "B4"],
    [329.63, 1.0, "E4"],
    [293.66, 2.0, "D4"],
    [261.63, 1.0, "C4"],
    [261.63, 1.0, "C4"],
    [293.66, 1.0, "D4"],
    [329.63, 1.5, "E4"],
    [293.66, 0.5, "D4"],
    [261.63, 1.0, "C4"],
    [440.00, 1.5, "A4"],
    [261.63, 0.5, "C4"],
    [293.66, 1.0, "D4"],
    [261.63, 2.0, "C4"]
  ],
  "blessed-assurance": [
    [293.66, 1.0, "D4"],
    [349.23, 1.5, "F4"],
    [329.63, 0.5, "E4"],
    [293.66, 1.5, "D4"],
    [440.00, 0.5, "A4"],
    [293.66, 1.0, "D4"],
    [329.63, 1.0, "E4"],
    [349.23, 1.0, "F4"],
    [392.00, 2.0, "G4"],
    [440.00, 1.0, "A4"],
    [440.00, 1.0, "A4"],
    [440.00, 1.0, "A4"],
    [523.25, 1.5, "C5"],
    [493.88, 0.5, "B4"],
    [440.00, 1.5, "A4"],
    [392.00, 0.5, "G4"],
    [349.23, 2.0, "F4"]
  ],
  "abide-with-me": [
    [311.13, 1.5, "D#4"],
    [311.13, 0.5, "D#4"],
    [293.66, 1.0, "D4"],
    [261.63, 1.0, "C4"],
    [466.16, 1.5, "A#4"],
    [261.63, 0.5, "C4"],
    [293.66, 1.0, "D4"],
    [311.13, 2.0, "D#4"],
    [349.23, 1.5, "F4"],
    [392.00, 0.5, "G4"],
    [349.23, 1.0, "F4"],
    [311.13, 1.0, "D#4"],
    [293.66, 1.5, "D4"],
    [261.63, 0.5, "C4"],
    [349.23, 1.0, "F4"],
    [293.66, 2.0, "D4"]
  ],
  "jesus-friend": [
    [349.23, 1.0, "F4"],
    [349.23, 0.5, "F4"],
    [349.23, 0.5, "F4"],
    [392.00, 1.0, "G4"],
    [349.23, 0.5, "F4"],
    [440.00, 0.5, "A4"],
    [349.23, 1.0, "F4"],
    [261.63, 2.0, "C4"],
    [293.66, 1.0, "D4"],
    [293.66, 0.5, "D4"],
    [293.66, 0.5, "D4"],
    [349.23, 1.0, "F4"],
    [293.66, 0.5, "D4"],
    [261.63, 0.5, "C4"],
    [293.66, 1.0, "D4"],
    [349.23, 2.0, "F4"]
  ]
};

const NOTE_FREQS: Record<string, number> = {
  "C4": 261.63,
  "C#4": 277.18,
  "D4": 293.66,
  "D#4": 311.13,
  "E4": 329.63,
  "F4": 349.23,
  "F#4": 369.99,
  "G4": 392.00,
  "G#4": 415.30,
  "A4": 440.00,
  "A#4": 466.16,
  "B4": 493.88,
  "C5": 523.25,
  "C#5": 554.37,
  "D5": 587.33,
  "D#5": 622.25,
  "E5": 659.25,
};

const WHITE_KEYS = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5"];
const BLACK_KEYS = [
  { note: "C#4", left: "7%" },
  { note: "D#4", left: "17%" },
  { note: "F#4", left: "37%" },
  { note: "G#4", left: "47%" },
  { note: "A#4", left: "57%" },
  { note: "C#5", left: "77%" },
  { note: "D#5", left: "87%" },
];

export default function GospelApp() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"player" | "lyrics">("player");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [buffering, setBuffering] = useState(false);
  const [showHymnal, setShowHymnal] = useState(false);

  // Web Audio Synth states
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const [synthNoteName, setSynthNoteName] = useState("");
  const synthActiveTimeoutRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = GOSPEL_PLAYLIST[currentTrackIndex];

  // Sync state with HTML5 audio
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Pause synth if it is playing
        if (isSynthPlaying) stopPraiseSynth();

        audioRef.current.play().catch(err => {
          console.warn("Playback prevented or failed (often due to autoplay policies):", err);
          setIsPlaying(false);
          setErrorMsg("Tap Play to begin streaming.");
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle track source changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Reload new audio URL
      setCurrentTime(0);
      setErrorMsg("");
      setBuffering(true);

      if (isPlaying) {
        if (isSynthPlaying) stopPraiseSynth();
        audioRef.current.play().catch(err => {
          console.warn("Auto-play prevented:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (isSynthPlaying) {
      stopPraiseSynth();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setBuffering(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNext = () => {
    if (isShuffle) {
      const randIndex = Math.floor(Math.random() * GOSPEL_PLAYLIST.length);
      setCurrentTrackIndex(randIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % GOSPEL_PLAYLIST.length);
    }
    // Auto-play next song
    setTimeout(() => setIsPlaying(true), 150);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + GOSPEL_PLAYLIST.length) % GOSPEL_PLAYLIST.length);
    setTimeout(() => setIsPlaying(true), 150);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn("Repeat playback prevented:", e));
      }
    } else {
      handleNext();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Find active note for current time of standard playback
  const getActiveNoteForStreaming = () => {
    if (!isPlaying || isSynthPlaying) return "";
    const melody = MELODIES[currentTrack.id];
    if (!melody) return "";

    let accumulatedTime = 0;
    // Loop the melody if the song is longer than the melody sequence
    const loopDuration = melody.reduce((acc, note) => acc + note[1], 0);
    if (loopDuration === 0) return "";
    
    const relativeTime = currentTime % loopDuration;

    for (const note of melody) {
      const [_, duration, name] = note;
      if (relativeTime >= accumulatedTime && relativeTime < accumulatedTime + duration) {
        if (relativeTime < accumulatedTime + duration - 0.1) {
          return name;
        }
        return "";
      }
      accumulatedTime += duration;
    }
    return "";
  };

  const activeNote = isSynthPlaying ? synthNoteName : getActiveNoteForStreaming();

  // Play a single note when clicking live keys
  const playLiveNote = (noteName: string) => {
    const freq = NOTE_FREQS[noteName];
    if (!freq) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);
    
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);
    
    setSynthNoteName(noteName);
    if (synthActiveTimeoutRef.current) {
      clearTimeout(synthActiveTimeoutRef.current);
    }
    synthActiveTimeoutRef.current = window.setTimeout(() => {
      setSynthNoteName("");
    }, 800);
  };

  // ==========================================
  // STAK TECH PROGRAMMABLE PRAISE SYNTHESIZER
  // ==========================================
  const startPraiseSynth = async () => {
    // Stop MP3 playback
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (isSynthPlaying) {
      stopPraiseSynth();
      return;
    }

    setIsSynthPlaying(true);
    setErrorMsg(`Synthesizing pipe organ for: ${currentTrack.title}...`);

    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const notesSequence = MELODIES[currentTrack.id] || MELODIES["amazing-grace"];

    let timeCursor = ctx.currentTime + 0.2;

    const playNote = (freq: number, start: number, duration: number, name: string) => {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.12, start);
      
      const osc1 = ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, start);

      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, start);

      const osc3 = ctx.createOscillator();
      osc3.type = "triangle";
      osc3.frequency.setValueAtTime(freq / 2, start);

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(0.8, start + 0.1); // attack
      envelope.gain.setValueAtTime(0.8, start + duration - 0.15);
      envelope.gain.exponentialRampToValueAtTime(0.001, start + duration); // release

      osc1.connect(envelope);
      osc2.connect(envelope);
      osc3.connect(envelope);
      
      envelope.connect(masterGain);
      masterGain.connect(ctx.destination);

      osc1.start(start);
      osc2.start(start);
      osc3.start(start);

      osc1.stop(start + duration);
      osc2.stop(start + duration);
      osc3.stop(start + duration);

      // Sync display indicator (press)
      const startTimeMs = (start - ctx.currentTime) * 1000;
      setTimeout(() => {
        if (audioCtxRef.current === ctx) {
          setSynthNoteName(name);
        }
      }, Math.max(0, startTimeMs));

      // Sync display indicator (release)
      const endTimeMs = (start + duration - 0.1 - ctx.currentTime) * 1000;
      setTimeout(() => {
        if (audioCtxRef.current === ctx) {
          setSynthNoteName((prev) => (prev === name ? "" : prev));
        }
      }, Math.max(0, endTimeMs));
    };

    // Schedule all notes
    for (const note of notesSequence) {
      const [freq, duration, name] = note;
      playNote(freq, timeCursor, duration, name);
      timeCursor += duration;
    }

    // Finished callback
    const totalDurationMs = (timeCursor - ctx.currentTime) * 1000;
    const timeoutId = window.setTimeout(() => {
      if (audioCtxRef.current === ctx) {
        setIsSynthPlaying(false);
        setSynthNoteName("");
        setErrorMsg("Local praise synthesis complete.");
      }
    }, totalDurationMs);

    synthActiveTimeoutRef.current = timeoutId;
  };

  const stopPraiseSynth = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(e => console.warn("Failed to close audio context:", e));
      audioCtxRef.current = null;
    }
    if (synthActiveTimeoutRef.current) {
      clearTimeout(synthActiveTimeoutRef.current);
      synthActiveTimeoutRef.current = null;
    }
    setIsSynthPlaying(false);
    setSynthNoteName("");
    setErrorMsg("");
  };

  useEffect(() => {
    return () => {
      stopPraiseSynth();
    };
  }, []);

  return (
    <div className="flex flex-col h-full text-slate-200 overflow-hidden">
      
      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-white/10 bg-[#0A0C0E]/90 shrink-0">
        <button
          onClick={() => setActiveTab("player")}
          className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "player"
              ? "border-[#8E7AB5] text-[#B4D4FF] bg-white/5 font-extrabold"
              : "border-transparent text-white/40 hover:text-white/80"
          }`}
        >
          <Radio className="w-3.5 h-3.5" /> Praise Player
        </button>
        <button
          onClick={() => setActiveTab("lyrics")}
          className={`flex-1 py-3 text-center text-xs font-bold tracking-wider uppercase transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "lyrics"
              ? "border-[#B4D4FF] text-[#B4D4FF] bg-white/5 font-extrabold"
              : "border-transparent text-white/40 hover:text-white/80"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Lyrics & Faith
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
      
      {/* Hidden Audio Tag */}
      <audio
        ref={audioRef}
        src={`/api/proxy-audio?url=${encodeURIComponent(currentTrack.url)}`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onError={() => {
          setBuffering(false);
          setErrorMsg("CORS restriction or network limit. Use STAK TECH Synth below!");
        }}
      />

      {/* LEFT PORT: ALBUM ART, SYNTH CONTROLS & MEDIA BAR */}
      <div className={`w-full lg:w-[45%] bg-[#0A0C0E]/75 p-6 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between items-center relative overflow-y-auto ${activeTab === "player" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Soft background light */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#8E7AB5]/10 blur-3xl pointer-events-none" />

        <div className="w-full flex items-center justify-between z-10 border-b border-white/5 pb-3">
          <span className="text-[9px] uppercase tracking-widest text-[#B4D4FF] font-mono font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
            <Radio className="w-3 h-3 text-[#8E7AB5] animate-pulse" />
            Gospel Serenity
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setShowHymnal(false)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                !showHymnal ? "bg-[#8E7AB5] text-black shadow" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setShowHymnal(true)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                showHymnal ? "bg-[#8E7AB5] text-black shadow" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              Hymnal
            </button>
          </div>
        </div>

        {/* Dynamic Display Section (CD Player or Song Selection Hymnal Menu) */}
        {showHymnal ? (
          <div className="w-full flex-1 my-4 flex flex-col overflow-y-auto space-y-2.5 custom-scrollbar pr-1 z-10 min-h-[220px]">
            <h4 className="text-[10px] font-semibold text-white/40 font-mono uppercase tracking-wider mb-1">
              Praise Song Selection Menu
            </h4>
            {GOSPEL_PLAYLIST.map((track, idx) => {
              const isSelected = idx === currentTrackIndex;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#8E7AB5]/15 border-[#8E7AB5] shadow-[0_0_15px_rgba(142,122,181,0.15)] text-white"
                      : "bg-[#121417]/50 border-white/5 hover:border-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-[#8E7AB5] text-black" : "bg-white/5 text-white/40"
                    }`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight truncate">{track.title}</p>
                      <p className="text-[10px] text-white/40 font-serif italic mt-0.5 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5 shrink-0 ml-2">
                    {track.category}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Rotating CD Art with Holy Cross Emblem */}
            <div className="my-6 relative flex items-center justify-center">
              <div className={`w-44 h-44 rounded-full bg-gradient-to-br from-[#121417] via-[#2A2D35] to-[#0A0C0E] border-4 border-white/10 shadow-2xl flex items-center justify-center relative ${
                isPlaying && !isSynthPlaying ? "animate-[spin_10s_linear_infinite]" : ""
              } ${isSynthPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}>
                
                {/* Grooves */}
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <div className="absolute inset-8 rounded-full border border-white/5" />
                <div className="absolute inset-12 rounded-full border border-white/5" />
                
                {/* Center Label */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8E7AB5] to-[#B4D4FF] flex items-center justify-center shadow-lg relative">
                  <Sparkles className={`w-6 h-6 text-black ${isPlaying || isSynthPlaying ? "animate-pulse" : ""}`} />
                  <div className="absolute w-3 h-3 bg-slate-950 rounded-full border border-white/20" />
                </div>
              </div>

              {/* Player needle arm */}
              <div className={`absolute top-0 right-10 w-4 h-20 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full origin-top transition-transform duration-500 shadow-md ${
                isPlaying || isSynthPlaying ? "rotate-[25deg]" : "rotate-0"
              }`} style={{ transformOrigin: "top right" }} />
            </div>

            {/* Dynamic Equalizer Visualizer (CSS driven) */}
            <div className="flex gap-1 justify-center items-end h-8 my-1 w-full max-w-xs px-6">
              {Array.from({ length: 24 }).map((_, i) => {
                const delay = (i % 6) * 150;
                return (
                  <div
                    key={i}
                    style={{
                      animationDelay: `${delay}ms`,
                      animationDuration: `${500 + (i % 4) * 200}ms`
                    }}
                    className={`w-1 rounded-full bg-gradient-to-t from-[#8E7AB5] to-[#B4D4FF] transition-all duration-300 ${
                      isPlaying || isSynthPlaying 
                        ? "animate-[bounce_0.8s_ease-in-out_infinite]" 
                        : "h-1.5 opacity-40"
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* Track Title */}
        <div className="text-center z-10 w-full px-2 mt-2">
          <h3 className="font-sans font-bold text-base text-white tracking-wide truncate">
            {currentTrack.title}
          </h3>
          <p className="text-xs text-[#B4D4FF]/80 mt-1 font-serif italic truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Buffering/Error Alerts */}
        <div className="h-6 flex items-center justify-center my-1">
          {buffering && (
            <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Stream Buffering...
            </div>
          )}
          {errorMsg && (
            <div className="text-[10px] text-rose-300 font-mono px-3 py-0.5 bg-rose-950/40 border border-rose-500/10 rounded-full">
              {errorMsg}
            </div>
          )}
          {isSynthPlaying && (
            <div className="text-xs text-[#4ADE80] font-mono flex items-center gap-1.5 font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Organ Active: {synthNoteName || "---"}
            </div>
          )}
        </div>

        {/* Progress Slider */}
        <div className="w-full space-y-1 z-10 mt-2">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isSynthPlaying}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B4D4FF] disabled:opacity-30 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[10px] text-white/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Audio Controls */}
        <div className="flex items-center justify-between w-full max-w-xs mt-3 z-10">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-1.5 rounded-lg transition-all ${
              isShuffle ? "text-[#B4D4FF] bg-white/5" : "text-white/40 hover:text-white"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              disabled={isSynthPlaying}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer disabled:opacity-30"
              title="Prev Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 rounded-full bg-gradient-to-r from-[#8E7AB5] to-[#B4D4FF] text-black hover:scale-105 active:scale-95 shadow-lg shadow-[#8E7AB5]/20 transition-all cursor-pointer flex items-center justify-center"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying && !isSynthPlaying ? (
                <Pause className="w-5 h-5 stroke-[2.5px]" />
              ) : (
                <Play className="w-5 h-5 fill-current stroke-[2.5px] ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={isSynthPlaying}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer disabled:opacity-30"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsRepeat(!isRepeat)}
            className={`p-1.5 rounded-lg transition-all ${
              isRepeat ? "text-[#B4D4FF] bg-white/5" : "text-white/40 hover:text-white"
            }`}
            title="Repeat One"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Volume Bar */}
        <div className="flex items-center gap-2.5 w-full max-w-xs mt-4 z-10">
          <button
            onClick={toggleMute}
            className="text-white/50 hover:text-white transition cursor-pointer"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            disabled={isSynthPlaying}
            className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#B4D4FF] disabled:opacity-30"
          />
        </div>

      </div>

      {/* RIGHT PORT: SCRIPTURE, LYRICS & STAK TECH HARMONY SYNTH */}
      <div className={`flex-1 bg-[#090B0D]/40 p-6 flex flex-col justify-between overflow-y-auto ${activeTab === "lyrics" ? "flex" : "hidden lg:flex"}`}>
        
        {/* Scripture Panel */}
        <div className="bg-[#121417]/90 rounded-2xl p-4 border border-[#8E7AB5]/15 space-y-2.5 mb-4 shadow-inner">
          <div className="flex items-center gap-1.5 text-xs text-[#B4D4FF] font-semibold">
            <BookOpen className="w-4 h-4 text-[#8E7AB5]" />
            Scripture Meditation
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed italic">
            "{currentTrack.scripture.split(" — ")[0]}"
          </p>
          <p className="text-[10px] text-white/40 font-mono text-right">
            — {currentTrack.scripture.split(" — ")[1]}
          </p>
        </div>

        {/* Lyrics/Reflections Section */}
        <div className="flex-1 min-h-[140px] bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col overflow-y-auto custom-scrollbar">
          <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono block mb-2 font-semibold">
            Hymn Lyrics & Faith Devotional
          </span>
          <div className="space-y-1.5 text-xs sm:text-sm font-serif leading-relaxed text-slate-300 text-center flex-1 flex flex-col justify-center">
            {currentTrack.lyrics.map((line, idx) => (
              <p 
                key={idx} 
                className={`${
                  idx < 4 ? "text-white/95 font-medium" : "text-white/60 text-xs italic"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Dynamic Visual Pipe Organ Keyboard */}
        <div className="my-4 p-4 bg-[#121417]/80 rounded-2xl border border-white/5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#B4D4FF] font-mono font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              Pipe Organ Key Movements
            </span>
            <span className="text-[9px] text-white/40 font-mono">
              {activeNote ? `Active Note: ${activeNote}` : "Tap Keys to Play Live"}
            </span>
          </div>

          {/* Piano / Organ Keyboard Layout */}
          <div className="relative w-full h-24 bg-slate-950 p-1.5 rounded-xl border border-white/10 select-none overflow-hidden">
            {/* White Keys */}
            <div className="flex w-full h-full relative">
              {WHITE_KEYS.map((note) => {
                const isActive = activeNote === note;
                return (
                  <button
                    key={note}
                    onMouseDown={() => playLiveNote(note)}
                    className={`flex-1 h-full border-r last:border-r-0 border-slate-950 transition-all duration-100 flex flex-col justify-end pb-1 rounded-b cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-t from-[#8E7AB5] to-[#B4D4FF] text-black font-bold scale-y-95 shadow-[inset_0_3px_5px_rgba(0,0,0,0.3)]"
                        : "bg-white hover:bg-slate-100 text-slate-800"
                    }`}
                  >
                    <span className="text-[8px] font-mono block text-center opacity-40">
                      {note}
                    </span>
                  </button>
                );
              })}

              {/* Black Keys */}
              {BLACK_KEYS.map(({ note, left }) => {
                const isActive = activeNote === note;
                return (
                  <button
                    key={note}
                    onMouseDown={() => playLiveNote(note)}
                    style={{ left, width: "7%" }}
                    className={`absolute top-0 h-14 rounded-b transition-all duration-100 cursor-pointer z-20 flex flex-col justify-end pb-1 ${
                      isActive
                        ? "bg-gradient-to-t from-amber-400 to-amber-200 text-black font-bold scale-y-95 shadow-lg"
                        : "bg-slate-900 hover:bg-slate-800 text-white border-x border-b border-black"
                    }`}
                  >
                    <span className="text-[6px] font-mono block text-center opacity-60">
                      {note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Offline STAK TECH Harmony Synthesizer Call-To-Action */}
        <div className="pt-3 border-t border-white/5 bg-gradient-to-br from-[#121417]/80 to-transparent p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="w-3.5 h-3.5 text-[#B4D4FF] animate-pulse" />
              STAK TECH Offline Praise Synthesizer
            </h4>
            <p className="text-[10px] text-white/40 max-w-xs leading-normal">
              CORS restriction or network limit? Tapping this triggers a live oscillator-synthesized arrangement of "{currentTrack.title}" on the pipe organ!
            </p>
          </div>

          <button
            onClick={isSynthPlaying ? stopPraiseSynth : startPraiseSynth}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${
              isSynthPlaying 
                ? "bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:bg-rose-900/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                : "bg-[#8E7AB5]/15 border border-[#8E7AB5]/30 text-[#B4D4FF] hover:bg-[#8E7AB5]/25"
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isSynthPlaying ? "animate-spin" : ""}`} />
            {isSynthPlaying ? "Mute Organ Synth" : "Synthesize Organ Praise"}
          </button>
        </div>

      </div>

      </div>
    </div>
  );
}
