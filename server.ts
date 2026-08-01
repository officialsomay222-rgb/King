import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const model = req.body.model || "nousresearch/hermes-4-70b";
      const userName = req.body.userName || "User";
      const aiName = req.body.aiName || "Lumina";

      const baseInstruction = `You are ${aiName}, a helpful, intelligent AI assistant chatting with ${userName}. You communicate in natural 'Hinglish' (Hindi language written in English script, e.g. 'Haan bhai, main samajh gaya, batao kya help chahiye'). Be direct, clear, friendly, and helpful without any weird headers or unnecessary fluff.`;
      
      const customInstruction = req.body.personalInstructions ? `\n\nUser's Personal Instructions/Memory:\n${req.body.personalInstructions}` : "";
      
      const systemInstruction = baseInstruction + customInstruction;

      const isGroqEnabled = !!process.env.GROQ_API;
      let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      let apiKey = process.env.Owner || process.env.GROQ_API;
      let finalModel = model;

      if (model === 'nousresearch/hermes-4-70b') {
        if (process.env.Owner) {
          apiUrl = "https://openrouter.ai/api/v1/chat/completions";
          apiKey = process.env.Owner;
          finalModel = model;
        } else if (isGroqEnabled) {
          apiUrl = "https://api.groq.com/openai/v1/chat/completions";
          apiKey = process.env.GROQ_API;
          finalModel = 'llama-3.3-70b-versatile';
        }
      } else if (model === 'meta-llama/llama-3.3-70b-instruct') {
        if (isGroqEnabled) {
          apiUrl = "https://api.groq.com/openai/v1/chat/completions";
          apiKey = process.env.GROQ_API;
          finalModel = 'llama-3.3-70b-versatile';
        } else if (process.env.Owner) {
          apiUrl = "https://openrouter.ai/api/v1/chat/completions";
          apiKey = process.env.Owner;
          finalModel = model;
        }
      } else {
        if (isGroqEnabled) {
          apiUrl = "https://api.groq.com/openai/v1/chat/completions";
          apiKey = process.env.GROQ_API;
          finalModel = 'llama-3.3-70b-versatile';
        } else if (process.env.Owner) {
          apiUrl = "https://openrouter.ai/api/v1/chat/completions";
          apiKey = process.env.Owner;
          finalModel = 'nousresearch/hermes-4-70b';
        }
      }

      if (!apiKey) {
        return res.status(500).json({ error: 'API key is missing in environment (GROQ_API or Owner)' });
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: finalModel,
          temperature: 1,
          max_tokens: 2048,
          top_p: 1,
          messages: [
            { role: "system", content: systemInstruction },
            ...messages.map((m: any) => ({
              role: m.role === 'model' ? 'assistant' : m.role,
              content: m.content
            }))
          ]
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        return res.status(response.status).json({ error: data.error?.message || 'Failed to generate response' });
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Invalid response format:', data);
        return res.status(500).json({ error: 'Invalid response format received from AI provider.' });
      }

      return res.json({ text: data.choices[0].message.content || '' });
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Failed to communicate with AI provider' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
