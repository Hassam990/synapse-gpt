
'use server';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Message as GenkitMessage, part, Part } from 'genkit';
import wav from 'wav';
import { prompts } from '@/app/prompts';
import type { AiMessage } from '@/app/actions';

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

  const latestMessage = history[history.length - 1];
  const hasMedia = !!latestMessage?.media;

  const modelRef = hasMedia
    ? googleAI.model('gemini-2.5-pro')
    : googleAI.model('gemini-2.5-flash');

  const toGenkitMessages = (messages: AiMessage[]): GenkitMessage[] => {
    return messages.map((message) => {
      const parts: Part[] = [];
      
      // Genkit requires a text part, even if it's empty for media messages.
      parts.push(part.text(message.content || ''));

      if (message.media) {
          parts.push(part.media(message.media));
      }
      
      return {
        role: message.role === 'user' ? 'user' : 'model',
        parts: parts,
      };
    });
  };

  const genkitMessages = toGenkitMessages(history);
  const modelHistory = genkitMessages.slice(0, -1);
  const lastMessageParts = genkitMessages[genkitMessages.length - 1].parts;

  try {
    const { stream } = await ai.generateStream({
      model: modelRef,
      prompt: lastMessageParts,
      history: modelHistory,
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
      system: systemPrompt,
    });

    // Return a new ReadableStream that processes the AI's output stream
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error during AI stream processing:", error);
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing the AI response.';
          controller.error(new Error(errorMessage));
        }
      },
    });

  } catch(e) {
    // If ai.generateStream itself fails, re-throw the error to be caught by the server action.
    console.error("Failed to start AI stream generation:", e);
    throw e;
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

  const result = await ai.generate({
    system: systemPrompt,
    prompt: userPrompt,
  });

  if (!result) {
      throw new Error("AI generation failed for code execution. Check API key and server logs.");
  }

  return result.text;
}


export async function generateCodeFromPrompt(prompt: string, language: string): Promise<{ code: string; stdin: string; }> {
  const systemPrompt = prompts.codeGenerator(language);

  const result = await ai.generate({
    model: googleAI.model('gemini-2.5-pro'),
    system: systemPrompt,
    prompt: prompt,
  });

  if (!result) {
      throw new Error("AI generation failed for code generation. Check API key and server logs.");
  }
  const text = result.text;

  try {
    // The AI might return the JSON inside a markdown block. Clean it up.
    const cleanedJson = text.replace(/```json\n?/g, '').replace(/```/g, '');
    const parsedResult = JSON.parse(cleanedJson);
    return {
        code: parsedResult.code || '',
        stdin: parsedResult.stdin || ''
    };
  } catch (e) {
    console.error("Failed to parse AI response for code generation. Falling back to raw text.", e);
    // Fallback: if the AI just returned raw code, use that.
    return { code: text, stdin: '' };
  }
}
