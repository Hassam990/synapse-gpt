
'use server';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Part } from 'genkit';
import wav from 'wav';
import { prompts } from '@/app/prompts';
import type { AiMessage } from '@/app/actions';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d: Buffer) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

export async function synapse(
  systemPrompt: string,
  history: AiMessage[]
): Promise<ReadableStream<any>> {
  if (history.length === 0) {
    throw new Error("Cannot invoke AI with an empty message history.");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing. Chat requires Groq for high-performance quota-free operation.");
  }

  try {
    const groqMessages = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant' as any,
      content: msg.content,
    }));

    console.log(">>> [Synapse] Dispatching to Groq Llama 3.3 70B...");
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...groqMessages,
          ],
        }),
      }).catch(err => {
        console.error(">>> [Synapse:FETCH_CRITICAL]", err);
        throw new Error(`Direct Fetch to Groq Failed: ${err.message || err}`);
      });

    if (!groqRes.ok) {
        const errorText = await groqRes.text();
        throw new Error(`Groq API Status ${groqRes.status}: ${errorText}`);
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content || "";
    console.log(">>> [Synapse] Groq response received successfully.");

    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(content));
        controller.close();
      },
    });
  } catch (e: any) {
    console.error(">>> [Synapse] FATAL Chat Error:", e);
    throw new Error(`Chat Engine Failure: ${e.message}`);
  }
}

export async function generateAudio(text: string) {
  const ttsModel = googleAI.model('gemini-2.5-flash-preview-tts');

  const { media } = await ai.generate({
    model: ttsModel,
    prompt: text,
    config: {
      responseModalities: ['AUDIO'],
    },
  });

  if (!media) {
    throw new Error('Audio generation failed, no media returned.');
  }

  const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
  const wavBase64 = await toWav(audioBuffer);
  const audioDataUri = 'data:audio/wav;base64,' + wavBase64;

  return { audio: audioDataUri };
}

export async function executeCodeInSandbox(code: string, language: string, stdin: string): Promise<string> {
  const systemPrompt = prompts.codeBuilder(language);
  
  const userPrompt = `Code:
${code}

---
Stdin:
${stdin || ''}
`;

  if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing. Code execution requires Groq.");
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
        throw new Error(`Groq Execution Error: ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    return groqData.choices?.[0]?.message?.content || "";
  } catch (e: any) {
    console.error(">>> [Sandbox] Execution Error:", e);
    throw new Error(`Execution Failed: ${e.message}`);
  }
}


export async function generateCodeFromPrompt(prompt: string, language: string): Promise<{ code: string; stdin: string; }> {
  const systemPrompt = prompts.codeGenerator(language);

  if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing. Code generation requires Groq.");
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!groqRes.ok) {
        throw new Error(`Groq Generation Error: ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    const text = groqData.choices?.[0]?.message?.content || "";

    // The AI returns JSON as per response_format
    const parsedResult = JSON.parse(text);
    return {
        code: parsedResult.code || '',
        stdin: parsedResult.stdin || ''
    };
  } catch (e: any) {
    console.error(">>> [Generator] Error:", e);
    throw new Error(`Generation Failed: ${e.message}`);
  }
}
