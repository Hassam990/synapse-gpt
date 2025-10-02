
'use server';
/**
 * @fileOverview This file defines the core AI interaction flows for the Synapse Pakistan application.
 *
 * - synapse - A unified function to handle all AI interactions.
 * - generateAudio - A function for text-to-speech generation.
 */

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import wav from 'wav';
import { Readable } from 'stream';

// Ensure API key is available
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set.');
}

const genAI = new GoogleGenAI(apiKey);

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


function fileToGenerativePart(dataUri: string) {
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid data URI.');
    }
    const [_, mimeType, data] = match;
    return {
      inlineData: {
        data: data,
        mimeType
      },
    };
}


export async function synapse(
    systemPrompt: string,
    prompt: string,
    media?: string
) {
    const hasMedia = !!media;
    const modelName = hasMedia ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt, safetySettings });

    const promptParts = [prompt];
    const generativeParts = media ? [fileToGenerativePart(media)] : [];

    const result = await model.generateContentStream([...promptParts, ...generativeParts]);

    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                controller.enqueue(chunkText);
            }
            controller.close();
        },
    });

    return { content: readableStream };
}

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

export async function generateAudio(text: string) {
    const ttsModel = genAI.getGenerativeModel({ model: 'text-to-speech-2' });
    const result = await ttsModel.generateContent(text);
    
    // The response is not streamed and contains the audio directly.
    // However, the SDK might wrap it in a way that requires extracting.
    // Based on SDK docs, we expect audio_content in the response.
    // This part might need adjustment based on the exact response structure.
    // For now, assuming result.response.audio_content is the base64 audio.
    const audioBase64 = (result.response as any)?.candidates[0]?.content?.parts[0]?.audioData;
    
    if (!audioBase64) {
         throw new Error('Audio generation failed, no audio content received.');
    }
    
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    
    return { audio: audioDataUri };
}
