import express from 'express';
import { createServer as createViteServer } from 'vite';
import { initDb } from './src/server/db.js';
import { webhookRoutes } from './src/server/webhooks.js';
import { sseRoutes } from './src/server/sse.js';
import { authRoutes } from './src/server/auth.js';
import { historyRoutes } from './src/server/history.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database
  initDb();

  // Webhook routes (must be before express.json() if they need raw body for signature, 
  // but usually Lemon Squeezy needs raw body. We will handle it in the router)
  app.use('/api/webhook', webhookRoutes);

  // SSE Routes for real-time client updates
  app.use('/api/events', sseRoutes);

  // Standard API routes
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/history', historyRoutes);
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/translate', async (req, res) => {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const { obj, targetLang } = req.body;
      
      const prompt = `Translate the following JSON object values to ${targetLang}. Keep the keys exactly the same. Do not translate placeholders like {{label}}. Return ONLY valid JSON, no markdown formatting.

JSON to translate:
${JSON.stringify(obj, null, 2)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: error.message });
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
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
