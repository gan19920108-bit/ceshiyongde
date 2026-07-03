import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for AI text generation (Gemini or SillyTavern proxy)
  app.post("/api/generate", async (req, res) => {
    const { prompt, apiType, sillyTavernUrl, sillyTavernKey, responseLength } = req.body;

    try {
      if (apiType === "sillytavern") {
        // Connect to SillyTavern proxy/API
        const endpoint = sillyTavernUrl || "http://localhost:8000";
        const targetUrl = endpoint.endsWith("/") ? `${endpoint}api/v1/generate` : `${endpoint}/api/v1/generate`;
        
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(sillyTavernKey ? { "Authorization": `Bearer ${sillyTavernKey}` } : {})
          },
          body: JSON.stringify({
            prompt: prompt,
            max_context_length: responseLength === "short" ? 500 : responseLength === "medium" ? 1200 : 2500,
            max_length: responseLength === "short" ? 80 : responseLength === "medium" ? 200 : 450,
          })
        });

        if (!response.ok) {
          throw new Error(`SillyTavern server returned error status: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.results?.[0]?.text || data.text || JSON.stringify(data);
        return res.json({ reply });
      } else {
        // Standard Gemini API call
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return res.status(500).json({ error: "Missing GEMINI_API_KEY in server environment variables. Please check Settings > Secrets in AI Studio." });
        }

        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            }
          }
        });

        // Adjust prompt instructions based on size selection
        let sizeInstruction = "";
        if (responseLength === "short") {
          sizeInstruction = "\n【要求：言简意赅，回复字数限制在 50 字以内。】";
        } else if (responseLength === "medium") {
          sizeInstruction = "\n【要求：详略得当，回复字数控制在 150 字左右。】";
        } else {
          sizeInstruction = "\n【要求：辞藻丰富，回复字数控制在 400 字左右，充分展开细节。】";
        }

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `${prompt}${sizeInstruction}`,
        });

        const reply = response.text;
        return res.json({ reply });
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      return res.status(500).json({ error: err.message || "未知错误" });
    }
  });

  // API route for AI streaming text generation (Gemini)
  app.post("/api/generate-stream", async (req, res) => {
    const { prompt, temperature, topP } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.write(`data: ${JSON.stringify({ error: "Missing GEMINI_API_KEY in server secrets" })}\n\n`);
        return res.end();
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: typeof temperature === 'number' ? temperature : 0.8,
          topP: typeof topP === 'number' ? topP : 0.95,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err: any) {
      console.error("Stream Generation failed:", err);
      res.write(`data: ${JSON.stringify({ error: err.message || "天道流转受阻" })}\n\n`);
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

