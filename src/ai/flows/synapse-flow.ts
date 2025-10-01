'use server';
/**
 * @fileOverview This file defines the core Genkit flow for the Synapse Pakistan application.
 *
 * - synapse - A unified function to handle all AI interactions based on different modes.
 * - SynapseInput - The input type for the synapse function.
 * - SynapseOutput - The return type for the synapse function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'zod';
import wav from 'wav';
import type { Language } from '@/app/prompts';

const SynapseInputSchema = z.object({
  prompt: z.string().describe('The user query.'),
  systemPrompt: z.string().describe('The system prompt based on the selected mode.'),
  media: z.string().optional().describe(
    "Optional media file (e.g., image) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
  ),
  language: z.enum(['roman-urdu', 'english']).describe('The language for the AI response.'),
});
export type SynapseInput = z.infer<typeof SynapseInputSchema>;

const SynapseOutputSchema = z.object({
  content: z.any().describe('The AI-generated text response as a stream.'),
});
export type SynapseOutput = z.infer<typeof SynapseOutputSchema>;

const AudioOutputSchema = z.object({
  audio: z.string().optional().describe('The AI-generated audio response as a data URI.'),
});

export async function synapse(input: SynapseInput): Promise<SynapseOutput> {
  return synapseFlow(input);
}

export async function generateAudio(text: string) {
  return generateAudioFlow(text);
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

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const synapseFlow = ai.defineFlow(
  {
    name: 'synapseFlow',
    inputSchema: SynapseInputSchema,
    outputSchema: SynapseOutputSchema,
  },
  async (input) => {
    
    const promptParts = [];
    promptParts.push({ text: input.systemPrompt });

    if (input.media) {
        promptParts.push({ media: { url: input.media } });
    }
    promptParts.push({ text: `User prompt: ${input.prompt}` });

    const {stream} = ai.generateStream({
        model: googleAI.model('gemini-1.5-flash'),
        prompt: promptParts,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk.text);
        }
        controller.close();
      },
    });

    return { content: readableStream as any };
  }
);

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: z.string(),
    outputSchema: AudioOutputSchema,
  },
  async (text) => {
     const audioResult = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: text,
    });

    let audioDataUri: string | undefined = undefined;
    if (audioResult.media) {
        const audioBuffer = Buffer.from(
            audioResult.media.url.substring(audioResult.media.url.indexOf(',') + 1),
            'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    }
     return { audio: audioDataUri };
  }
);
