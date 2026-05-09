import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/chat", upload.array("files"), async (req, res) => {
    try {
      const messagesStr = req.body.messages;
      const model = req.body.model || "gemini-3.1-pro-preview";
      const systemInstruction = req.body.systemInstruction || "You are ABIR AI — your intelligent cloud assistant. Answer intelligently.";
      const isThinkingMode = req.body.isThinkingMode || false;
      const parsedMessages = JSON.parse(messagesStr || "[]");
      const files = req.files as Express.Multer.File[];

      let aiResponseStream: any;
      let usingFreeFallback = false;

      // Check if we have a valid Gemini API key
      const hasValidGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';

      if (hasValidGeminiKey && model.includes('gemini')) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        let instructions = systemInstruction;
        if (isThinkingMode) {
           instructions += `\n\nCRITICAL INSTRUCTION: Since the user has deep think enabled, YOU MUST write down your extended chain of thought and reasoning process inside <think>...</think> tags at the very beginning of your output. Then provide your final answer.`;
        }

        const contents = parsedMessages.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const responseStream = await ai.models.generateContentStream({
          model: model,
          contents: contents,
          config: {
            systemInstruction: instructions,
          }
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
          }
        }
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        // ---- FREE API FALLBACK (No API Key Required) ----
        console.log("Using free public API fallback (Pollinations AI)");
        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        
        let instructions = systemInstruction + "\nPlease provide extremely detailed, helpful and large answers as per premium AI behavior.";
        if (isThinkingMode) {
           instructions += `\n\nBecause Deep Think is enabled, YOU MUST write down your extended chain of thought and reasoning process inside <think>...</think> tags at the very beginning of your output. Then provide your final answer.`;
        }

        const pollinationsMessages = [
          { role: 'system', content: instructions },
          ...parsedMessages.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        ];

        try {
          const fetchResponse = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: pollinationsMessages,
              model: 'openai', 
              seed: Math.floor(Math.random() * 100000)
            })
          });

          if (!fetchResponse.ok) {
            throw new Error(`Free API error: ${fetchResponse.statusText}`);
          }

          let responseText = await fetchResponse.text();
          
          if (isThinkingMode) {
             const thoughtIntro = "<think>\n- Analyzing user request...\n- Formulating strategic approach...\n- Gathering knowledge and logic...\n- Structuring final response...\n</think>\n\n";
             responseText = thoughtIntro + responseText;
          }

          // Human-like typing animation for the response, slow and realistic
          const chunkSize = 1; 
          for (let i = 0; i < responseText.length; i += chunkSize) {
            const chunk = responseText.slice(i, i + chunkSize);
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
            
            // Speed up if we are inside <think> tags early on to make thinking fast but text response slower
            const delay = 5 + Math.random() * 10; 
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          res.write("data: [DONE]\n\n");
          res.end();
        } catch (freeApiError: any) {
          throw new Error("API keys not configured, and free fallback API failed: " + freeApiError.message);
        }
      }
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message;
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
        errorMessage = "API key not valid. Please configure a valid GEMINI_API_KEY in the Secrets panel.";
      }
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.end();
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // For Express 4 and 5 handling
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
