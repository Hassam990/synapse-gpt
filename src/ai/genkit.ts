
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {genkitEval} from 'genkitx-eval';
import {dotprompt} from 'genkitx-dotprompt';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    }),
    genkitEval(),
    dotprompt(),
  ],
  logSinks: [
    // In dev, just log to the console.
    {
      name: 'dev-logger',
      log(log) {
        if (log.level > 3) {
          console.debug(log);
        }
      },
      async flush() {},
    },
  ],
  defaultModel: {
    name: 'googleai/gemini-1.5-flash',
  },
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  enableTracingAndMetrics: true,
});
