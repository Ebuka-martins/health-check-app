import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

console.log("🚀 Health Check App Starting...");

app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GROQ_API_KEY) {
    return res.json({ reply: "AI service is being configured. Please try again later." });
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
          { 
            role: "system", 
            content: "You are a helpful wellness assistant. Provide supportive health advice." 
          },
          { role: "user", content: message },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || "Hello! How can I help with your wellness today?";
    res.json({ reply: aiReply });

  } catch (error) {
    res.json({ reply: "Temporary connection issue. Please try again." });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});