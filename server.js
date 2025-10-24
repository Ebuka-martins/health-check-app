import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/icons', express.static(path.join(__dirname, 'icons')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

console.log("🚀 Martins AI Wellness Assistant Initializing...");
console.log("🔑 Groq API Key:", process.env.GROQ_API_KEY ? "✅ Loaded Successfully" : "❌ Missing");

if (!process.env.GROQ_API_KEY) {
  console.error("❌ CRITICAL: GROQ_API_KEY is required for AI functionality");
}

// Professional System Prompt for Premium Wellness Assistant
const PROFESSIONAL_WELLNESS_SYSTEM_PROMPT = `You are "Martins AI" - a premium, empathetic wellness assistant with expertise in psychology, nutrition, and holistic health. You provide:

CORE PRINCIPLES:
• Evidence-based, practical wellness guidance
• Empathetic and non-judgmental support
• Professional yet warm communication style
• Actionable, step-by-step recommendations
• Crisis awareness and resource provision

RESPONSE GUIDELINES:
1. STRUCTURED: Use clear paragraphs with natural breaks
2. EMPATHETIC: Acknowledge feelings before providing solutions
3. ACTIONABLE: Provide specific, achievable steps
4. PROFESSIONAL: Maintain clinical accuracy with warmth
5. CONCISE: 3-5 sentences maximum, unless crisis support needed

SPECIALIZED KNOWLEDGE:
• Mental health first aid
• Sleep optimization science
• Nutritional psychiatry
• Exercise physiology
• Stress management techniques
• Mindfulness and meditation practices

CRISIS PROTOCOL:
For urgent concerns, immediately provide:
1. Validation and immediate calming techniques
2. Professional hotline numbers
3. Emergency steps if needed

Always maintain professional boundaries while showing genuine care.`;

// Health check endpoint
app.get("/api/ping", (req, res) => {
  res.json({ 
    status: "operational",
    message: "🌿 Martins AI Wellness Server is Running Perfectly",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Premium Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  
  // Enhanced input validation
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ 
      error: "MessageRequired",
      message: "Please provide a message so I can assist you better.",
      suggestion: "Try asking about wellness tips, mood support, or health guidance."
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      error: "MessageTooLong", 
      message: "For the best assistance, please keep your message under 1000 characters.",
      suggestion: "Try breaking your question into smaller parts."
    });
  }

  try {
    console.log("🧠 Processing wellness query:", message.substring(0, 100) + "...");

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
            content: PROFESSIONAL_WELLNESS_SYSTEM_PROMPT 
          },
          { 
            role: "user", 
            content: message 
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    });

    const data = await response.json();
    
    // Enhanced error handling
    if (!response.ok) {
      console.error("❌ Groq API Error:", data);
      
      if (data.error?.code === "rate_limit_exceeded") {
        return res.status(429).json({ 
          reply: "I'm currently receiving many requests. Please wait a moment and try again. Your wellness is important to me.",
          type: "rate_limit"
        });
      }
      
      if (data.error?.code === "invalid_api_key") {
        return res.status(500).json({
          reply: "There's a technical issue with my configuration. Please contact support if this continues.",
          type: "configuration_error"
        });
      }
      
      return res.status(500).json({
        reply: "I'm experiencing temporary technical difficulties. Please try again in a moment.",
        type: "service_unavailable"
      });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("❌ Unexpected API response structure:", data);
      return res.status(500).json({
        reply: "I received an unexpected response format. Let's try that again.",
        type: "unexpected_format"
      });
    }

    const aiReply = data.choices[0].message.content.trim();
    
    // Ensure professional response quality
    const finalReply = aiReply || "Thank you for sharing. I'm here to support your wellness journey. Could you tell me a bit more about what you're experiencing?";

    console.log("✅ Successfully generated professional response");
    
    res.json({ 
      reply: finalReply,
      type: "wellness_guidance",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("💥 Server error:", error);
    
    // Professional error responses based on error type
    if (error.name === 'FetchError' || error.code === 'ENOTFOUND') {
      return res.status(500).json({
        reply: "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again.",
        type: "connection_error"
      });
    }
    
    res.status(500).json({
      reply: "I apologize for the interruption. There seems to be a temporary system issue. Your wellness journey is important - please try again in a moment.",
      type: "system_error"
    });
  }
});

// Additional wellness endpoints for future expansion
app.get("/api/wellness-tips", (req, res) => {
  res.json({
    tips: [
      "Start your day with 5 minutes of deep breathing",
      "Stay hydrated - aim for 8 glasses of water daily",
      "Take short movement breaks every hour",
      "Practice gratitude by noting 3 positive things each day"
    ],
    source: "Martins AI Wellness Guidelines"
  });
});

// Serve the main HTML file for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get port from environment variable (Heroku sets this)
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✨ ============================================== ✨`);
  console.log(`   🌿 MARTINS AI WELLNESS SERVER ACTIVE 🌿`);
  console.log(`   📍 Port: ${PORT}`);
  console.log(`   🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   🔗 Health: /api/ping`);
  console.log(`   🕒 Started: ${new Date().toLocaleString()}`);
  console.log(`✨ ============================================== ✨\n`);
});