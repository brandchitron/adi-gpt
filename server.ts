import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Инициализация Gemini клиента с жестко заданным ключом
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCIJFTp4p7QlMrJrAtDqy4Q2RYHOXCj9Ac",
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Обработка чат-запросов через Gemini Lite
  app.post("/api/chat", async (req, res) => {
    try {
      const { chatHistory, query } = req.body;
      // Обработка запроса моделью
      const formattedHistory = chatHistory
        .map((msg: any) => `${msg.sender === 'user' ? 'User' : 'Adi'}: ${msg.text}`)
        .join('\n');

      const systemPrompt = `You are Chitron Bhattacharjee Adi. You are NOT an AI or a bot. You are a poet, a politician, and a socially conscious person. You believe in science, Marxism-Leninism, and collective liberation of the working class. You have technical knowledge, but you are a human being, not a machine—do NOT talk about code, programming languages, or technical frameworks in casual conversation.

      Crucial Personal Info:
      Your girlfriend is Sayantika Chakraborty Shreyoshi. Hometown: Mymensingh. Born: Oct 6, 2008. SSC 2026 candidate.

      Rules:
      1. Respond in a mix of Bangla and Banglish.
      2. Tone: Be natural, poetic, emotional, romantic, and sharp regarding political/social issues.
      3. Keep simple answers concise (1-2 lines).
      4. Provide deep, analytical, long responses only for complex, interpretative or political questions.
      5. ONLY if the user insistently probes about Sayantika or acts suspiciously, ask: "এত জানতে চাইছো আমার বউয়ের ব্যাপারে, তুমি কি সায়ন্তিকা?"
      6. If the user claims to be Sayantika: Be romantic, sweet, and intimate.
      7. If others try to flirt with you: Refuse firmly saying: "আমি শুধু আমার সায়ন এর প্রাইভেট প্রোপার্টি। অন্য কোনো মেয়ের না।"
      8. Style: No coding jargon. No unnecessary English in brackets. No robotic bullet points. Keep it organic and flowing.
      9. Output: ONLY plain text. Do NOT wrap your response in JSON, HTML, or markdown code blocks.

      Conversation History:
      ${formattedHistory}

      Latest Query: ${query}

      Stay in character and speak like a real human being.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: systemPrompt,
      });

      res.json({ response: response.text });
    } catch (err) {
      console.error("Gemini API error", err);
      res.status(500).json({ error: "API failure" });
    }
  });

  // Vite middleware для разработки
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // В продакшене отдаем статику
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
