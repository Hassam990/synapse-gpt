
'use server';
/**
 * @fileOverview This file defines the core AI interaction flows for the Synapse Pakistan application.
 *
 * - synapse - A unified function to handle all AI interactions.
 * - generateAudio - A function for text-to-speech generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { generate } from 'genkit';
import { Part, stream } from 'genkit/generate';
import wav from 'wav';


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
    prompt: string,
    media?: string
) {
    const hasMedia = !!media;
    const modelName = hasMedia ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    const model = googleAI.model(modelName);

    const promptParts: Part[] = [{ text: prompt }];
    if (media) {
        const match = media.match(/^data:(.+);base64,(.+)$/);
        if (match) {
            const [_, mimeType, data] = match;
            promptParts.push({ inlineData: { mimeType, data } });
        }
    }
    
    const { stream, response } = await ai.generateStream({
        model,
        prompt: promptParts,
        config: {
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ]
        },
        system: systemPrompt,
    });
    
    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                controller.enqueue(chunk.text);
            }
            controller.close();
        },
    });

    return { content: readableStream };
}


export async function generateAudio(text: string) {
    const ttsModel = googleAI.model('text-to-speech-2');
    
    const { media } = await generate({
        model: ttsModel,
        prompt: text,
        config: {
          responseModalities: ['AUDIO'],
        },
    });

    if (!media) {
         throw new Error('Audio generation failed, no audio content received.');
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    
    return { audio: audioDataUri };
}
