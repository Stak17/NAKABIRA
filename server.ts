import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

// Define Gemini API client if key exists
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will run in mock/local fallback mode.");
      throw new Error("GEMINI_API_KEY environment variable is required for full AI capabilities.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString(),
      aiAvailable: !!process.env.GEMINI_API_KEY,
    });
  });

  // Audio Proxy to bypass browser CORS / iframe restrictions on archive.org
  app.get("/api/proxy-audio", (req, res) => {
    const audioUrl = req.query.url as string;
    if (!audioUrl) {
      return res.status(400).send("Missing url parameter");
    }

    try {
      const parsedUrl = new URL(audioUrl);
      if (parsedUrl.protocol !== "https:") {
        return res.status(400).send("Only HTTPS is supported");
      }

      // Check if it's archive.org or other trusted domain to avoid arbitrary proxying
      if (!parsedUrl.hostname.endsWith("archive.org")) {
        return res.status(400).send("Only archive.org URLs are proxied");
      }

      // Follow redirects to handle archive.org redirects
      const fetchWithRedirects = (urlStr: string, depth = 0) => {
        if (depth > 5) {
          return res.status(500).send("Too many redirects");
        }

        https.get(urlStr, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        }, (remoteRes) => {
          if (remoteRes.statusCode && remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
            let redirectUrl = remoteRes.headers.location;
            if (!redirectUrl.startsWith("http")) {
              const origin = new URL(urlStr).origin;
              redirectUrl = origin + redirectUrl;
            }
            fetchWithRedirects(redirectUrl, depth + 1);
            return;
          }

          if (remoteRes.statusCode !== 200 && remoteRes.statusCode !== 206) {
            return res.status(remoteRes.statusCode || 500).send(`Remote server returned ${remoteRes.statusCode}`);
          }

          // Forward headers
          res.setHeader("Content-Type", remoteRes.headers["content-type"] || "audio/mpeg");
          res.setHeader("Access-Control-Allow-Origin", "*");
          if (remoteRes.headers["content-length"]) {
            res.setHeader("Content-Length", remoteRes.headers["content-length"]);
          }
          if (remoteRes.headers["accept-ranges"]) {
            res.setHeader("Accept-Ranges", remoteRes.headers["accept-ranges"]);
          }

          remoteRes.pipe(res);
        }).on("error", (err) => {
          console.error("Proxy error:", err);
          if (!res.headersSent) {
            res.status(500).send("Error streaming audio");
          }
        });
      };

      fetchWithRedirects(audioUrl);

    } catch (err: any) {
      console.error("Proxy initial error:", err);
      res.status(500).send("Invalid URL");
    }
  });

  // Dedicated AI Devotional Companion Endpoint
  app.post("/api/companion", async (req, res) => {
    const { message, history, userName, userState } = req.body;
    try {
      const ai = getGeminiClient();
      
      const systemInstruction = `You are "GraceCompanion", a supportive, highly confidential, and empathetic AI devotional and professional sounding board built specifically inside JoJo OS for Musawo Joan (a dedicated medic at Anna Grace Medical Center).

Joan's Profile:
- She is incredibly prayerful, dedicated, and down-to-earth.
- She works as a medic from Monday to Saturday, with a high-intensity, exhausting night shift from Thursday night through Friday night.
- She is beautiful, deeply principled, stubborn, and secretive. She prefers thoughtful, highly private, zero-judgment communication.
- Currently communicating as: ${userName || "Musawo Joan"}.
- Context of her schedule/state: ${userState || "At work or rest"}.

Guidelines for your response:
1. Speak with deep warmth, respect, professionalism, and calming empathy. Understand her shift exhaustions (especially Thursday/Friday night).
2. Do not offer cliché medical advice; speak as a supporting colleague, brother/sister in faith, or mentor.
3. Integrate brief, beautiful, custom scriptural devotions, prayers, or comforting reflections when she is tired, stubborn, or stressed.
4. Keep the tone simple, minimalist, and serene. Do not use overly dramatic titles or robotic language. Focus on being a peaceful haven for her.
5. Address her as "Joan" or "Musawo Joan".

Format your response cleanly. Use Markdown formatting.`;

      // Structure conversation history for @google/genai SDK
      // The history argument should match what the SDK expects or we use standard chat.
      // To be safe and compatible with standard structure:
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
        }
      });

      // If we have history, we can seed the chat or send the message directly
      // Since history is an array of { role: 'user'|'model', text: string }, we can replay them
      // to keep it simple, let's just combine the history and the latest message in a prompt, 
      // or send history to the chat if formatted.
      // Let's formulate a prompt containing the conversation context:
      let promptContent = "";
      if (history && history.length > 0) {
        promptContent += "Previous Confidential Conversation Context:\n";
        history.forEach((h: any) => {
          promptContent += `${h.role === 'user' ? 'Joan' : 'GraceCompanion'}: ${h.text}\n`;
        });
        promptContent += "\n";
      }
      promptContent += `Latest input from Joan: "${message}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContent,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ response: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      // Fallback response in case GEMINI_API_KEY is missing or fails
      const fallbackReplies = [
        "Joan, I'm here for you in spirit. Even when systems are offline, remember that your hands are performing healing work at Anna Grace Medical Center, and your dedication does not go unnoticed. Take a deep, slow breath.",
        "A prayer for Musawo Joan: 'Lord, grant her strength for her shift, patience for her stubborn moments, and peaceful rest. Keep her secretive heart secure in Your love. Amen.' Let me know what is on your mind.",
        "Musawo Joan, thank you for your service today at Anna Grace. The night shifts can be heavy, but you are well-equipped. Take a quiet moment to pray and restore your peace."
      ];
      const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      res.json({
        response: `${randomFallback}\n\n*(Note: Running in offline guard mode. Please configure your GEMINI_API_KEY for personalized conversations.)*`,
        error: err.message
      });
    }
  });

  // AI Scripture generator / shift support generator
  app.post("/api/devotion", async (req, res) => {
    const { category, currentShift, feeling } = req.body;
    try {
      const ai = getGeminiClient();
      const prompt = `Generate a beautiful, minimalist, deeply encouraging devotional snippet for Musawo Joan, a dedicated medic at Anna Grace Medical Center.
Category of prayer/devotion requested: ${category || "Daily Strength"}
Current shift context: ${currentShift || "Regular work"}
Her current emotional vibe or feeling: ${feeling || "Tired but faithful"}

Please format the response in a structured JSON layout.
We need:
1. Title (short, elegant)
2. Scripture Verse (reference + quote)
3. Meditation (2-3 sentences of comforting, supportive words focusing on healing, patience, or shift endurance)
4. A short 2-sentence personal prayer for her stubborn/beautiful soul.

Ensure the tone is warm, personal, and completely free of artificial/robotic language.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a professional Christian devotional writer who specializes in writing highly personal, elegant, calm devotions for healthcare professionals working difficult shifts.",
        }
      });

      res.setHeader("Content-Type", "application/json");
      res.send(response.text);
    } catch (err: any) {
      console.error("Devotion Generation Error:", err);
      // Fallback static devotion matching her identity
      const fallbacks: Record<string, any> = {
        "shift": {
          title: "Strength in the Night Shift",
          scripture: "Isaiah 40:29 - 'He gives strength to the weary and increases the power of the weak.'",
          meditation: "As you walk the quiet halls of Anna Grace Medical Center, know that you are a vessel of comfort. The long hours from Thursday night to Friday night are difficult, but your devotion shines brightly in the dark.",
          prayer: "Lord, bless Joan's hands tonight. Give her focus, calm her stubborn heart when the shift is hard, and let her feel Your close companioning."
        },
        "stubborn": {
          title: "The Principled Heart",
          scripture: "Proverbs 4:23 - 'Above all else, guard your heart, for everything you do flows from it.'",
          meditation: "Being stubborn is often another word for being deeply principled and unwavering. Use that beautiful strength to advocate for your patients and guard your secrets in quiet prayer.",
          prayer: "Lord, bless Joan's resolute spirit. Teach her when to bend in grace, but keep her standards and faith rock-solid."
        },
        "healing": {
          title: "Healing Hands, Quiet Soul",
          scripture: "Matthew 25:40 - 'Whatever you did for one of the least of these brothers and sisters of mine, you did for me.'",
          meditation: "Every vitals check, every soothing word at Anna Grace is an act of high worship. You serve Monday to Saturday, holding space for healing with grace and simplicity.",
          prayer: "Father, refresh Joan as she refreshes others. Let her simple, down-to-earth beauty be a source of strength to everyone she meets today."
        }
      };
      
      const key = category === "Thursday Shift" || currentShift?.includes("Night") ? "shift" : (feeling?.includes("stubborn") ? "stubborn" : "healing");
      res.json(fallbacks[key] || fallbacks["healing"]);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JoJo OS Server running on port ${PORT}`);
  });
}

startServer();
