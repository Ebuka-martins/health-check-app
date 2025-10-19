import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log("Loaded key:", process.env.OPENAI_API_KEY ? "✅ exists" : "❌ missing");

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a friendly wellness assistant." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    console.log("🔍 OpenAI raw response:", data); // 👈 added this line

    const aiReply = data.choices?.[0]?.message?.content || "No response received.";
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Error connecting to AI service." });
  }
});

