import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
  : null;
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    aiConfigured: Boolean(ai)
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key missing in Render."
      });
    }
    const message = req.body.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }
    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim(),
      config: {
        systemInstruction:
          "You are DARK AI, a friendly and helpful AI assistant. Answer clearly."
      }
    });
    res.json({
      reply: response.text || "No response generated."
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      error: "AI service failed. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log("DARK AI running on port " + PORT);
});
