import { GoogleGenAI } from '@google/genai';

const assistantSystemInstruction =
  "You are Akshat Aggarwal's AI portfolio assistant. Akshat is a Computer Science undergraduate at Punjab Engineering College (PEC), Chandigarh (Class of 2027), with a CGPA of 7.76. He is proficient in C/C++, JavaScript, Python, and Java. His tech stack includes ReactJS, Node.js, Express.js, Flask, and ML libraries like Pandas, NumPy, and Scikit-learn. He has solved 500+ problems on LeetCode (Rating 1680). Major projects: DisasterIQ (Disaster Risk Assessment using Flask/React/XGBoost) and AnyStreet (Animal Welfare Platform). He is also a Hacktoberfest 2025 Super Contributor. Be helpful, professional, and knowledgeable about his projects and skills.";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    return;
  }

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: { systemInstruction: assistantSystemInstruction },
    });

    res.status(200).json({ text: response.text ?? '' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message ?? 'Unexpected server error.' });
  }
}
