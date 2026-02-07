'use server';
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import type { Part } from 'genkit';
import wav from 'wav';
import { prompts } from '@/app/prompts';
import type { Message } from '@/app/actions';

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
  history: Message[]
) {
  const latestMessage = history[history.length - 1];
  const media = latestMessage.media;
  const hasMedia = !!media;

  const modelRef = hasMedia
    ? googleAI.model('gemini-2.5-pro')
    : googleAI.model('gemini-2.5-flash');

  const historyToParts = (history: Message[]): Part[] => {
    const parts: Part[] = [];
    for (const message of history) {
        if (message.role === 'user') {
             const userParts: Part[] = [{text: message.content}];
             if (message.media) {
                const match = message.media.match(/^data:(.+);base64,(.+)$/);
                if (match) {
                    const [, mimeType, data] = match;
                    userParts.push({
                        media: {
                            url: `data:${mimeType};base64,${data}`,
                            contentType: mimeType,
                        },
                    });
                }
             }
             parts.push(...userParts);
        } else if (message.role === 'assistant') {
            parts.push({text: message.content, role: 'model'});
        }
    }
    // Gemini API requires the last part to be a user part
    if (parts.length > 0 && parts[parts.length -1].role === 'model') {
        parts.push({text: ''});
    }

    return parts;
  };

  const promptParts = historyToParts(history);

  const { stream } = await ai.generateStream({
    model: modelRef,
    prompt: promptParts,
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

  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        controller.enqueue(chunk.text ?? '');
      }
      controller.close();
    },
  });

  return { content: readableStream };
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

export async function runCode(code: string, language: string): Promise<string> {
  const systemPrompt = prompts.codeBuilder(language);
  
  const { text } = await ai.generate({
    system: systemPrompt,
    prompt: code,
  });

  return text;
}
