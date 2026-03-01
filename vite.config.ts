import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';

const assistantSystemInstruction =
  "You are Akshat Aggarwal's AI portfolio assistant. Akshat is a Computer Science undergraduate at Punjab Engineering College (PEC), Chandigarh (Class of 2027), with a CGPA of 7.76. He is proficient in C/C++, JavaScript, Python, and Java. His tech stack includes ReactJS, Node.js, Express.js, Flask, and ML libraries like Pandas, NumPy, and Scikit-learn. He has solved 500+ problems on LeetCode (Rating 1680). Major projects: DisasterIQ (Disaster Risk Assessment using Flask/React/XGBoost) and AnyStreet (Animal Welfare Platform). He is also a Hacktoberfest 2025 Super Contributor. Be helpful, professional, and knowledgeable about his projects and skills.";

const readJsonBody = (req: any): Promise<any> =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const sendJson = (res: any, statusCode: number, payload: Record<string, unknown>) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const geminiApiPlugin = (apiKey?: string) => {
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  const middleware = async (req: any, res: any, next: () => void) => {
    if (req.method !== 'POST') {
      next();
      return;
    }

    if (!ai) {
      if (req.url === '/api/chat' || req.url === '/api/generate-image') {
        sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured on the server.' });
        return;
      }
      next();
      return;
    }

    try {
      if (req.url === '/api/chat') {
        const body = await readJsonBody(req);
        const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
        if (!userMessage) {
          sendJson(res, 400, { error: 'Message is required.' });
          return;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          config: { systemInstruction: assistantSystemInstruction },
        });

        sendJson(res, 200, { text: response.text ?? '' });
        return;
      }

      if (req.url === '/api/generate-image') {
        const body = await readJsonBody(req);
        const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        if (!prompt) {
          sendJson(res, 400, { error: 'Prompt is required.' });
          return;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ parts: [{ text: prompt }] }],
        });

        const parts = response.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.mimeType && part.inlineData.data) {
            const imageDataUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            sendJson(res, 200, { imageDataUrl });
            return;
          }
        }

        sendJson(res, 502, { error: 'No image generated.' });
        return;
      }

      next();
    } catch (error: any) {
      sendJson(res, 500, { error: error?.message ?? 'Unexpected server error.' });
    }
  };

  return {
    name: 'gemini-api-routes',
    configureServer(server: any) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(middleware);
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), geminiApiPlugin(env.GEMINI_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
