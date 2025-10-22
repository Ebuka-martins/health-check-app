import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log("Loaded Groq key:", process.env.GROQ_API_KEY ? "✅ exists" : "❌ missing");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is required but missing! Get free key from: https://console.groq.com");
}

// Health check endpoint
app.get("/api/ping", (req, res) => {
  res.json({ message: "✅ Server is alive" });
});

// Enhanced wellness system prompt
const WELLNESS_SYSTEM_PROMPT = `You are a friendly, empathetic wellness assistant. You provide:
- Short, actionable health advice (1-2 sentences)
- Emotional support and validation
- Practical wellness tips
- Encouraging but realistic feedback
- Crisis resources when needed

Always be supportive, non-judgmental, and focus on practical steps. Keep responses under 3 sentences unless it's crisis support.`;

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: WELLNESS_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("🔍 Groq raw response:", data);

    if (data.error) {
      console.error("Groq API error:", data.error);
      return res.status(500).json({ reply: "I'm having trouble connecting right now. Please try again in a moment." });
    }

    const aiReply = data.choices?.[0]?.message?.content || "I'm here to help! Could you tell me more about how you're feeling?";
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "I'm having connection issues. Please check your internet and try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Wellness server running on port ${PORT}`);
  console.log(`💡 Health check available at: http://localhost:${PORT}/api/ping`);
});