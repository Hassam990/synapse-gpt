import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
  ],
  // You can optionally set a default model here using googleAI.model(...)
  // but you don't pass a string directly as `defaultModel`.
  model: googleAI.model('gemini-2.5-flash'),
});
