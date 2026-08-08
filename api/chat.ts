export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const model = body.model || "nousresearch/hermes-4-70b";
    const userName = body.userName || "User";
    const aiName = body.aiName || "Lumina";

    const baseInstruction = `You are ${aiName}, a helpful, intelligent AI assistant chatting with ${userName}. You communicate in natural 'Hinglish' (Hindi language written in English script, e.g. 'Haan bhai, main samajh gaya, batao kya help chahiye'). Be direct, clear, friendly, and helpful without any weird headers or unnecessary fluff.`;
    
    const customInstruction = body.personalInstructions ? `\n\nUser's Personal Instructions/Memory:\n${body.personalInstructions}` : "";
    
    const systemInstruction = baseInstruction + customInstruction;

    const isGroqEnabled = !!process.env.GROQ_API;
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    let apiKey = process.env.Owner || process.env.GROQ_API;
    let finalModel = model;

    if (model === 'Qwen/Qwen3.6-27B') {
      apiUrl = `https://router.huggingface.co/v1/chat/completions`;
      apiKey = process.env.HF_TOKEN;
      finalModel = model;
      if (!apiKey) {
         return res.status(500).json({ error: 'HF_TOKEN environment variable is missing on Vercel' });
      }
    } else if (model === 'nousresearch/hermes-4-70b') {
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
      return res.status(500).json({ error: 'API key is missing in environment variables. Please check GROQ_API, Owner, or HF_TOKEN in Vercel settings.' });
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
      const errorMessage = typeof data.error === 'string' ? data.error : data.error?.message || 'Failed to generate response';
      return res.status(response.status).json({ error: errorMessage });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format:', data);
      return res.status(500).json({ error: 'Invalid response format received from AI provider.' });
    }

    return res.json({ text: data.choices[0].message.content || '' });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ error: error?.message || 'Failed to communicate with AI provider' });
  }
}
