
'use server';
import wav from 'wav';
import { prompts } from '@/app/prompts';
import type { AiMessage } from '@/app/actions';

// No longer using Groq SDK to avoid build issues; using direct fetch instead.

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
  // Placeholder to prevent build errors while we fix dependencies
  console.log("Audio generation requested but currently disabled for build stability:", text);
  return { audio: null };
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

export async function generateStudyGuideFromSlides(slidesContent: string, subject: string): Promise<{ test_sheet: any[]; explanations: any[]; }> {
  const systemPrompt = prompts.studyGuideGenerator(subject);

  if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing. Study guide generation requires Groq.");
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
          { role: 'user', content: slidesContent },
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!groqRes.ok) {
        throw new Error(`Groq Generation Error: ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    const text = groqData.choices?.[0]?.message?.content || "";

    const parsedResult = JSON.parse(text);
    return {
        test_sheet: parsedResult.test_sheet || [],
        explanations: parsedResult.explanations || []
    };
  } catch (e: any) {
    console.error(">>> [StudyGuide] Error:", e);
    throw new Error(`Study Guide Generation Failed: ${e.message}`);
  }
}
