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
        model: "llama-3.1-8b-instant", // Free model
        messages: [
          { role: "system", content: "You are a friendly wellness assistant." },
          { role: "user", content: message },
        ],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();
    console.log("🔍 Groq raw response:", data);

    const aiReply = data.choices?.[0]?.message?.content || "No response received.";
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Error connecting to AI service." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});